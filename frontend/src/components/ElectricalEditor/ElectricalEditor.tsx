import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from 'react-i18next';
import {
  Save, Download, ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, Trash2,
  MousePointer2, Move, Square, Type, Grid3X3, Minus, Copy, Plus
} from 'lucide-react';
import { DiagramData, DiagramElement, Connection, CanvasSettings, DiagramType } from '../../types';
import { electricalSymbols, symbolCategories, getSymbolsByCategory, wireTypes } from './symbols/electricalSymbols';
import SymbolRenderer from './SymbolRenderer';

interface ElectricalEditorProps {
  diagramData?: DiagramData;
  diagramType: DiagramType;
  onSave: (data: DiagramData) => void;
  onExportPdf?: () => void;
}

const defaultCanvasSettings: CanvasSettings = {
  width: 1200,
  height: 800,
  gridSize: 20,
  gridVisible: true,
  snapToGrid: true,
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  backgroundColor: '#ffffff'
};

type Tool = 'select' | 'pan' | 'draw-wall' | 'draw-wire' | 'text';

const ElectricalEditor: React.FC<ElectricalEditorProps> = ({
  diagramData,
  diagramType,
  onSave,
  onExportPdf
}) => {
  const { t } = useTranslation();
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Canvas state
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>(
    diagramData?.canvas || defaultCanvasSettings
  );
  const [elements, setElements] = useState<DiagramElement[]>(diagramData?.elements || []);
  const [connections, setConnections] = useState<Connection[]>(diagramData?.connections || []);

  // Editor state
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('outlets');
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

  // History for undo/redo
  const [history, setHistory] = useState<DiagramData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  const [selectedWireType, setSelectedWireType] = useState('power');

  // Resize handler
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setStageSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      const nodes = selectedIds
        .map(id => stageRef.current?.findOne(`#${id}`))
        .filter(Boolean) as Konva.Node[];
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedIds]);

  // Save to history
  const saveToHistory = useCallback(() => {
    const newState: DiagramData = { canvas: canvasSettings, elements, connections };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [canvasSettings, elements, connections, history, historyIndex]);

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setCanvasSettings(prevState.canvas);
      setElements(prevState.elements);
      setConnections(prevState.connections);
      setHistoryIndex(historyIndex - 1);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setCanvasSettings(nextState.canvas);
      setElements(nextState.elements);
      setConnections(nextState.connections);
      setHistoryIndex(historyIndex + 1);
    }
  };

  // Snap to grid
  const snapToGrid = (value: number): number => {
    if (!canvasSettings.snapToGrid) return value;
    return Math.round(value / canvasSettings.gridSize) * canvasSettings.gridSize;
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    const newScale = Math.max(0.1, Math.min(3, canvasSettings.scale + delta));
    setCanvasSettings(prev => ({ ...prev, scale: newScale }));
  };

  // Handle wheel zoom
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const scaleBy = 1.05;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = canvasSettings.scale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - canvasSettings.offsetX) / oldScale,
      y: (pointer.y - canvasSettings.offsetY) / oldScale
    };

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));

    setCanvasSettings(prev => ({
      ...prev,
      scale: clampedScale,
      offsetX: pointer.x - mousePointTo.x * clampedScale,
      offsetY: pointer.y - mousePointTo.y * clampedScale
    }));
  };

  // Handle stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedIds([]);
    }
  };

  // Handle element selection
  const handleElementSelect = (id: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool !== 'select') return;

    const isShiftPressed = e.evt.shiftKey;
    if (isShiftPressed) {
      setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };

  // Handle element drag
  const handleElementDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setElements(prev => prev.map(el =>
      el.id === id
        ? { ...el, x: snapToGrid(node.x()), y: snapToGrid(node.y()) }
        : el
    ));
    saveToHistory();
  };

  // Add symbol to canvas
  const handleAddSymbol = (symbolId: string) => {
    const symbol = electricalSymbols.find(s => s.id === symbolId);
    if (!symbol) return;

    const newElement: DiagramElement = {
      id: uuidv4(),
      type: symbolId,
      x: snapToGrid(stageSize.width / 2 / canvasSettings.scale - canvasSettings.offsetX / canvasSettings.scale),
      y: snapToGrid(stageSize.height / 2 / canvasSettings.scale - canvasSettings.offsetY / canvasSettings.scale),
      width: symbol.defaultWidth,
      height: symbol.defaultHeight,
      rotation: 0,
      properties: { ...symbol.properties }
    };

    setElements(prev => [...prev, newElement]);
    setSelectedIds([newElement.id]);
    saveToHistory();
  };

  // Delete selected elements
  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setElements(prev => prev.filter(el => !selectedIds.includes(el.id)));
    setConnections(prev => prev.filter(
      c => !selectedIds.includes(c.fromElementId || '') && !selectedIds.includes(c.toElementId || '')
    ));
    setSelectedIds([]);
    saveToHistory();
  };

  // Duplicate selected elements
  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    const newElements = elements
      .filter(el => selectedIds.includes(el.id))
      .map(el => ({
        ...el,
        id: uuidv4(),
        x: el.x + 20,
        y: el.y + 20
      }));
    setElements(prev => [...prev, ...newElements]);
    setSelectedIds(newElements.map(el => el.id));
    saveToHistory();
  };

  // Handle wire drawing
  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool !== 'draw-wire') return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = snapToGrid((pos.x - canvasSettings.offsetX) / canvasSettings.scale);
    const y = snapToGrid((pos.y - canvasSettings.offsetY) / canvasSettings.scale);

    setIsDrawing(true);
    setDrawingPoints([x, y]);
  };

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || selectedTool !== 'draw-wire') return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = snapToGrid((pos.x - canvasSettings.offsetX) / canvasSettings.scale);
    const y = snapToGrid((pos.y - canvasSettings.offsetY) / canvasSettings.scale);

    // Update last point for preview
    const newPoints = [...drawingPoints];
    if (newPoints.length >= 2) {
      newPoints[newPoints.length - 2] = x;
      newPoints[newPoints.length - 1] = y;
    }
    setDrawingPoints(newPoints);
  };

  const handleStageMouseUp = () => {
    if (!isDrawing || selectedTool !== 'draw-wire') return;

    if (drawingPoints.length >= 4) {
      const wireType = wireTypes.find(w => w.id === selectedWireType) || wireTypes[0];
      const newConnection: Connection = {
        id: uuidv4(),
        points: drawingPoints,
        strokeColor: wireType.color,
        strokeWidth: wireType.strokeWidth,
        dashed: wireType.dashed,
        wireType: selectedWireType as any
      };
      setConnections(prev => [...prev, newConnection]);
      saveToHistory();
    }

    setIsDrawing(false);
    setDrawingPoints([]);
  };

  // Handle wire click to add point
  const handleWireClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (selectedTool !== 'draw-wire' || !isDrawing) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pos = stage.getPointerPosition();
    if (!pos) return;

    const x = snapToGrid((pos.x - canvasSettings.offsetX) / canvasSettings.scale);
    const y = snapToGrid((pos.y - canvasSettings.offsetY) / canvasSettings.scale);

    setDrawingPoints(prev => [...prev, x, y]);
  };

  // Save diagram
  const handleSave = () => {
    const data: DiagramData = {
      canvas: canvasSettings,
      elements,
      connections,
      metadata: {
        modifiedAt: new Date().toISOString()
      }
    };
    onSave(data);
  };

  // Fit to screen
  const handleFitToScreen = () => {
    setCanvasSettings(prev => ({
      ...prev,
      scale: 1,
      offsetX: 0,
      offsetY: 0
    }));
  };

  // Render grid
  const renderGrid = () => {
    if (!canvasSettings.gridVisible) return null;

    const gridLines = [];
    const gridSize = canvasSettings.gridSize;
    const width = canvasSettings.width;
    const height = canvasSettings.height;

    // Vertical lines
    for (let i = 0; i <= width; i += gridSize) {
      gridLines.push(
        <Line
          key={`v-${i}`}
          points={[i, 0, i, height]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= height; i += gridSize) {
      gridLines.push(
        <Line
          key={`h-${i}`}
          points={[0, i, width, i]}
          stroke="#e0e0e0"
          strokeWidth={0.5}
        />
      );
    }

    return <>{gridLines}</>;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === 'Escape') {
        setSelectedIds([]);
        setSelectedTool('select');
        setIsDrawing(false);
      } else if (e.ctrlKey && e.key === 'z') {
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        handleRedo();
      } else if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, elements, connections, canvasSettings]);

  return (
    <div className="flex h-full bg-gray-100">
      {/* Left Panel - Symbol Library */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">{t('electrical.symbols.title', 'Symbolen')}</h3>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200">
          {symbolCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 text-xs rounded ${
                selectedCategory === cat.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={cat.name}
            >
              {cat.icon}
            </button>
          ))}
        </div>

        {/* Symbols grid */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid grid-cols-2 gap-2">
            {getSymbolsByCategory(selectedCategory).map(symbol => (
              <button
                key={symbol.id}
                onClick={() => handleAddSymbol(symbol.id)}
                className="p-2 border border-gray-200 rounded hover:border-primary-500 hover:bg-primary-50 flex flex-col items-center gap-1 transition-colors"
                title={symbol.name}
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  <SymbolRenderer symbolId={symbol.id} width={24} height={24} />
                </div>
                <span className="text-xs text-gray-600 truncate w-full text-center">
                  {symbol.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Wire type selector (when draw-wire tool is active) */}
        {selectedTool === 'draw-wire' && (
          <div className="p-3 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('electrical.wireType', 'Kabeltype')}
            </h4>
            <div className="space-y-1">
              {wireTypes.map(wire => (
                <button
                  key={wire.id}
                  onClick={() => setSelectedWireType(wire.id)}
                  className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm ${
                    selectedWireType === wire.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div
                    className="w-6 h-1 rounded"
                    style={{ backgroundColor: wire.color }}
                  />
                  <span>{wire.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Top toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
          {/* File actions */}
          <button
            onClick={handleSave}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={t('common.save', 'Opslaan')}
          >
            <Save className="w-5 h-5" />
          </button>
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title={t('common.exportPdf', 'Exporteer PDF')}
            >
              <Download className="w-5 h-5" />
            </button>
          )}

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* History */}
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title={t('common.undo', 'Ongedaan maken')}
          >
            <Undo2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title={t('common.redo', 'Opnieuw')}
          >
            <Redo2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Tools */}
          <button
            onClick={() => setSelectedTool('select')}
            className={`p-2 rounded-lg ${selectedTool === 'select' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
            title={t('electrical.tools.select', 'Selecteren')}
          >
            <MousePointer2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedTool('pan')}
            className={`p-2 rounded-lg ${selectedTool === 'pan' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
            title={t('electrical.tools.pan', 'Verplaatsen')}
          >
            <Move className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSelectedTool('draw-wire')}
            className={`p-2 rounded-lg ${selectedTool === 'draw-wire' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
            title={t('electrical.tools.wire', 'Kabel tekenen')}
          >
            <Minus className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Selection actions */}
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={handleDuplicateSelected}
                className="p-2 hover:bg-gray-100 rounded-lg"
                title={t('common.duplicate', 'Dupliceren')}
              >
                <Copy className="w-5 h-5" />
              </button>
              <button
                onClick={handleDeleteSelected}
                className="p-2 hover:bg-red-100 text-red-600 rounded-lg"
                title={t('common.delete', 'Verwijderen')}
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-300 mx-2" />
            </>
          )}

          {/* Zoom controls */}
          <button
            onClick={() => handleZoom(-0.1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={t('common.zoomOut', 'Uitzoomen')}
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(canvasSettings.scale * 100)}%
          </span>
          <button
            onClick={() => handleZoom(0.1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={t('common.zoomIn', 'Inzoomen')}
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={handleFitToScreen}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title={t('common.fitToScreen', 'Passend in scherm')}
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          {/* Grid toggle */}
          <button
            onClick={() => setCanvasSettings(prev => ({ ...prev, gridVisible: !prev.gridVisible }))}
            className={`p-2 rounded-lg ${canvasSettings.gridVisible ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'}`}
            title={t('electrical.grid', 'Raster')}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
        </div>

        {/* Canvas container */}
        <div ref={containerRef} className="flex-1 overflow-hidden bg-gray-50">
          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={canvasSettings.scale}
            scaleY={canvasSettings.scale}
            x={canvasSettings.offsetX}
            y={canvasSettings.offsetY}
            draggable={selectedTool === 'pan'}
            onWheel={handleWheel}
            onClick={handleStageClick}
            onMouseDown={handleStageMouseDown}
            onMouseMove={handleStageMouseMove}
            onMouseUp={handleStageMouseUp}
            onDblClick={handleWireClick}
            onDragEnd={(e) => {
              if (selectedTool === 'pan') {
                setCanvasSettings(prev => ({
                  ...prev,
                  offsetX: e.target.x(),
                  offsetY: e.target.y()
                }));
              }
            }}
          >
            {/* Background layer */}
            <Layer>
              <Rect
                x={0}
                y={0}
                width={canvasSettings.width}
                height={canvasSettings.height}
                fill={canvasSettings.backgroundColor}
              />
              {renderGrid()}
            </Layer>

            {/* Connections layer */}
            <Layer>
              {connections.map(conn => (
                <Line
                  key={conn.id}
                  points={conn.points}
                  stroke={conn.strokeColor}
                  strokeWidth={conn.strokeWidth}
                  dash={conn.dashed ? [5, 5] : undefined}
                  lineCap="round"
                  lineJoin="round"
                />
              ))}

              {/* Drawing preview */}
              {isDrawing && drawingPoints.length >= 2 && (
                <Line
                  points={drawingPoints}
                  stroke={wireTypes.find(w => w.id === selectedWireType)?.color || '#000'}
                  strokeWidth={2}
                  dash={[5, 5]}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </Layer>

            {/* Elements layer */}
            <Layer>
              {elements.map(element => (
                <Group
                  key={element.id}
                  id={element.id}
                  x={element.x}
                  y={element.y}
                  rotation={element.rotation}
                  draggable={selectedTool === 'select'}
                  onClick={(e) => handleElementSelect(element.id, e)}
                  onDragEnd={(e) => handleElementDragEnd(element.id, e)}
                >
                  <SymbolRenderer
                    symbolId={element.type}
                    width={element.width}
                    height={element.height}
                    properties={element.properties}
                    isSelected={selectedIds.includes(element.id)}
                  />
                </Group>
              ))}

              {/* Transformer for selected elements */}
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  // Limit minimum size
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            </Layer>
          </Stage>
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-700">
            {t('electrical.properties', 'Eigenschappen')}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {selectedIds.length === 0 ? (
            <p className="text-sm text-gray-500">
              {t('electrical.selectElement', 'Selecteer een element om eigenschappen te bewerken')}
            </p>
          ) : selectedIds.length === 1 ? (
            (() => {
              const element = elements.find(e => e.id === selectedIds[0]);
              if (!element) return null;

              const symbol = electricalSymbols.find(s => s.id === element.type);

              return (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Type</label>
                    <p className="text-sm text-gray-600">{symbol?.name || element.type}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Positie</label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div>
                        <label className="text-xs text-gray-500">X</label>
                        <input
                          type="number"
                          value={element.x}
                          onChange={(e) => {
                            setElements(prev => prev.map(el =>
                              el.id === element.id
                                ? { ...el, x: parseInt(e.target.value) || 0 }
                                : el
                            ));
                          }}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Y</label>
                        <input
                          type="number"
                          value={element.y}
                          onChange={(e) => {
                            setElements(prev => prev.map(el =>
                              el.id === element.id
                                ? { ...el, y: parseInt(e.target.value) || 0 }
                                : el
                            ));
                          }}
                          className="w-full px-2 py-1 text-sm border rounded"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Rotatie</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={element.rotation}
                        onChange={(e) => {
                          setElements(prev => prev.map(el =>
                            el.id === element.id
                              ? { ...el, rotation: parseInt(e.target.value) }
                              : el
                          ));
                        }}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12">
                        {element.rotation}°
                      </span>
                    </div>
                  </div>

                  {/* Element-specific properties */}
                  {element.properties?.circuit && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Circuit</label>
                      <input
                        type="text"
                        value={element.properties.circuit || ''}
                        onChange={(e) => {
                          setElements(prev => prev.map(el =>
                            el.id === element.id
                              ? { ...el, properties: { ...el.properties, circuit: e.target.value } }
                              : el
                          ));
                        }}
                        className="w-full px-2 py-1 text-sm border rounded mt-1"
                        placeholder="bijv. A.1"
                      />
                    </div>
                  )}

                  {element.properties?.text !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tekst</label>
                      <input
                        type="text"
                        value={element.properties.text || ''}
                        onChange={(e) => {
                          setElements(prev => prev.map(el =>
                            el.id === element.id
                              ? { ...el, properties: { ...el.properties, text: e.target.value } }
                              : el
                          ));
                        }}
                        className="w-full px-2 py-1 text-sm border rounded mt-1"
                      />
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-gray-500">
              {selectedIds.length} {t('electrical.elementsSelected', 'elementen geselecteerd')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectricalEditor;
