import React from 'react';
import { Group, Circle, Rect, Line, Text, Arc, Path } from 'react-konva';

interface SymbolRendererProps {
  symbolId: string;
  width: number;
  height: number;
  properties?: Record<string, any>;
  isSelected?: boolean;
}

const SymbolRenderer: React.FC<SymbolRendererProps> = ({
  symbolId,
  width,
  height,
  properties = {},
  isSelected = false
}) => {
  const strokeColor = isSelected ? '#3b82f6' : '#333333';
  const strokeWidth = isSelected ? 2 : 1.5;

  // Render different symbols based on ID
  switch (symbolId) {
    // ============ OUTLETS ============
    case 'outlet-single':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[width / 2 - 5, height / 2 - 5, width / 2 - 5, height / 2 + 5]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[width / 2 + 5, height / 2 - 5, width / 2 + 5, height / 2 + 5]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'outlet-double':
      return (
        <Group>
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
            cornerRadius={4}
          />
          {/* First outlet */}
          <Circle x={width / 4} y={height / 2} radius={6} stroke={strokeColor} strokeWidth={1} />
          {/* Second outlet */}
          <Circle x={(width * 3) / 4} y={height / 2} radius={6} stroke={strokeColor} strokeWidth={1} />
        </Group>
      );

    case 'outlet-waterproof':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 6}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <Line
            points={[width / 2 - 4, height / 2 - 4, width / 2 - 4, height / 2 + 4]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    // ============ SWITCHES ============
    case 'switch-single':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[width / 2, height / 2, width / 2 + 10, height / 2 - 10]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
          />
        </Group>
      );

    case 'switch-double':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[width / 2, height / 2, width / 2 + 8, height / 2 - 10]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
          />
          <Line
            points={[width / 2, height / 2, width / 2 - 8, height / 2 - 10]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
          />
        </Group>
      );

    case 'switch-dimmer':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[width / 2, height / 2, width / 2 + 8, height / 2 - 10]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
          />
          {/* Dimmer indicator */}
          <Text
            text="D"
            x={width / 2 - 4}
            y={height / 2 + 2}
            fontSize={10}
            fill={strokeColor}
          />
        </Group>
      );

    case 'switch-motion':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          {/* Motion waves */}
          <Arc
            x={width / 2}
            y={height / 2}
            innerRadius={6}
            outerRadius={8}
            angle={60}
            rotation={-120}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <Arc
            x={width / 2}
            y={height / 2}
            innerRadius={10}
            outerRadius={12}
            angle={60}
            rotation={-120}
            stroke={strokeColor}
            strokeWidth={1}
          />
        </Group>
      );

    case 'switch-twoway':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[width / 2 - 5, height / 2 + 5, width / 2, height / 2, width / 2 + 8, height / 2 - 8]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
          />
        </Group>
      );

    // ============ LIGHTING ============
    case 'light-ceiling':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          {/* X pattern */}
          <Line
            points={[width / 4, height / 4, (width * 3) / 4, (height * 3) / 4]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[(width * 3) / 4, height / 4, width / 4, (height * 3) / 4]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'light-wall':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[width / 4, height / 4, (width * 3) / 4, (height * 3) / 4]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
          {/* Wall indicator */}
          <Line
            points={[0, height, width, height]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 1}
          />
        </Group>
      );

    case 'light-spot':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="#333"
          />
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 4}
            fill="white"
          />
        </Group>
      );

    case 'light-fluorescent':
      return (
        <Group>
          <Rect
            x={2}
            y={height / 4}
            width={width - 4}
            height={height / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[5, height / 2, width - 5, height / 2]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    // ============ DISTRIBUTION ============
    case 'breaker-main':
      return (
        <Group>
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[10, 15, width / 2, height / 2]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 1}
          />
          <Text
            text="4P"
            x={5}
            y={height - 18}
            fontSize={10}
            fill={strokeColor}
          />
        </Group>
      );

    case 'breaker-circuit':
      return (
        <Group>
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[8, 12, width / 2, height / 2 - 5]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
          />
          <Text
            text={`${properties?.amperage || 20}A`}
            x={5}
            y={height - 16}
            fontSize={9}
            fill={strokeColor}
          />
        </Group>
      );

    case 'breaker-rcd':
      return (
        <Group>
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[8, 12, width / 2, height / 2 - 5]}
            stroke={strokeColor}
            strokeWidth={strokeWidth + 0.5}
          />
          <Text
            text="ΔI"
            x={width / 2 - 8}
            y={height / 2}
            fontSize={10}
            fontStyle="bold"
            fill={strokeColor}
          />
          <Text
            text={`${properties?.sensitivity || 30}mA`}
            x={5}
            y={height - 16}
            fontSize={8}
            fill={strokeColor}
          />
        </Group>
      );

    case 'meter-electric':
      return (
        <Group>
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
            cornerRadius={2}
          />
          <Text
            text="kWh"
            x={width / 2 - 12}
            y={height / 2 - 5}
            fontSize={10}
            fill={strokeColor}
          />
        </Group>
      );

    // ============ WIRING ============
    case 'junction-box':
      return (
        <Group>
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Circle
            x={width / 2}
            y={height / 2}
            radius={3}
            fill={strokeColor}
          />
        </Group>
      );

    case 'cable-duct':
      return (
        <Group>
          <Rect
            x={0}
            y={height / 4}
            width={width}
            height={height / 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Line
            points={[5, height / 2, width - 5, height / 2]}
            stroke={strokeColor}
            strokeWidth={1}
            dash={[3, 3]}
          />
        </Group>
      );

    // ============ SPECIAL ============
    case 'doorbell':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Arc
            x={width / 2}
            y={height / 2 + 3}
            innerRadius={6}
            outerRadius={8}
            angle={180}
            rotation={-90}
            stroke={strokeColor}
            strokeWidth={1.5}
          />
          <Circle
            x={width / 2}
            y={height / 2 - 4}
            radius={2}
            fill={strokeColor}
          />
        </Group>
      );

    case 'thermostat':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Text
            text="T"
            x={width / 2 - 5}
            y={height / 2 - 7}
            fontSize={14}
            fontStyle="bold"
            fill={strokeColor}
          />
        </Group>
      );

    case 'smoke-detector':
      return (
        <Group>
          <Circle
            x={width / 2}
            y={height / 2}
            radius={width / 2 - 2}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Text
            text="S"
            x={width / 2 - 5}
            y={height / 2 - 7}
            fontSize={14}
            fontStyle="bold"
            fill={strokeColor}
          />
        </Group>
      );

    case 'intercom':
      return (
        <Group>
          <Rect
            x={2}
            y={2}
            width={width - 4}
            height={height - 4}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
            cornerRadius={3}
          />
          <Circle
            x={width / 2}
            y={height / 3}
            radius={5}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <Rect
            x={width / 4}
            y={height / 2}
            width={width / 2}
            height={height / 4}
            stroke={strokeColor}
            strokeWidth={1}
          />
        </Group>
      );

    // ============ STRUCTURE ============
    case 'wall':
    case 'wall-horizontal':
      return (
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#1a1a1a"
            stroke="#000000"
            strokeWidth={0.5}
          />
        </Group>
      );

    case 'wall-vertical':
      return (
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="#1a1a1a"
            stroke="#000000"
            strokeWidth={0.5}
          />
        </Group>
      );

    case 'wall-corner':
      return (
        <Group>
          {/* Horizontal part */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={properties?.thickness || 8}
            fill="#1a1a1a"
          />
          {/* Vertical part */}
          <Rect
            x={0}
            y={0}
            width={properties?.thickness || 8}
            height={height}
            fill="#1a1a1a"
          />
        </Group>
      );

    case 'door':
    case 'door-single':
      // Door with left swing arc
      return (
        <Group>
          {/* Wall opening (white background) */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={8}
            fill="white"
          />
          {/* Door leaf */}
          <Line
            points={[0, 8, 0, 8 + width * 0.9]}
            stroke={strokeColor}
            strokeWidth={2}
          />
          {/* Swing arc - quarter circle */}
          <Arc
            x={0}
            y={8}
            innerRadius={width * 0.88}
            outerRadius={width * 0.9}
            angle={90}
            rotation={0}
            stroke="#0088cc"
            strokeWidth={1}
            dash={[4, 2]}
          />
          {/* Hinge point */}
          <Circle
            x={0}
            y={8}
            radius={3}
            fill={strokeColor}
          />
        </Group>
      );

    case 'door-single-right':
      // Door with right swing arc
      return (
        <Group>
          {/* Wall opening (white background) */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={8}
            fill="white"
          />
          {/* Door leaf */}
          <Line
            points={[width, 8, width, 8 + width * 0.9]}
            stroke={strokeColor}
            strokeWidth={2}
          />
          {/* Swing arc - quarter circle */}
          <Arc
            x={width}
            y={8}
            innerRadius={width * 0.88}
            outerRadius={width * 0.9}
            angle={90}
            rotation={90}
            stroke="#0088cc"
            strokeWidth={1}
            dash={[4, 2]}
          />
          {/* Hinge point */}
          <Circle
            x={width}
            y={8}
            radius={3}
            fill={strokeColor}
          />
        </Group>
      );

    case 'door-double':
      return (
        <Group>
          {/* Wall opening */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={8}
            fill="white"
          />
          {/* Left door leaf */}
          <Line
            points={[0, 8, 0, 8 + width * 0.4]}
            stroke={strokeColor}
            strokeWidth={2}
          />
          {/* Left swing arc */}
          <Arc
            x={0}
            y={8}
            innerRadius={width * 0.38}
            outerRadius={width * 0.4}
            angle={90}
            rotation={0}
            stroke="#0088cc"
            strokeWidth={1}
            dash={[4, 2]}
          />
          {/* Right door leaf */}
          <Line
            points={[width, 8, width, 8 + width * 0.4]}
            stroke={strokeColor}
            strokeWidth={2}
          />
          {/* Right swing arc */}
          <Arc
            x={width}
            y={8}
            innerRadius={width * 0.38}
            outerRadius={width * 0.4}
            angle={90}
            rotation={90}
            stroke="#0088cc"
            strokeWidth={1}
            dash={[4, 2]}
          />
          {/* Hinge points */}
          <Circle x={0} y={8} radius={2} fill={strokeColor} />
          <Circle x={width} y={8} radius={2} fill={strokeColor} />
        </Group>
      );

    case 'door-sliding':
      return (
        <Group>
          {/* Wall opening */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={8}
            fill="white"
          />
          {/* Sliding track */}
          <Line
            points={[0, 4, width, 4]}
            stroke={strokeColor}
            strokeWidth={1}
            dash={[2, 2]}
          />
          {/* Door panel */}
          <Rect
            x={width * 0.1}
            y={1}
            width={width * 0.4}
            height={6}
            fill="#888"
            stroke={strokeColor}
            strokeWidth={1}
          />
          {/* Arrow showing direction */}
          <Line
            points={[width * 0.55, 4, width * 0.85, 4]}
            stroke="#0088cc"
            strokeWidth={1}
          />
          <Line
            points={[width * 0.75, 2, width * 0.85, 4, width * 0.75, 6]}
            stroke="#0088cc"
            strokeWidth={1}
          />
        </Group>
      );

    case 'window':
    case 'window-single':
      return (
        <Group>
          {/* Wall sections on sides */}
          <Rect x={0} y={0} width={4} height={height} fill="#1a1a1a" />
          <Rect x={width - 4} y={0} width={4} height={height} fill="#1a1a1a" />
          {/* Window glass area */}
          <Rect
            x={4}
            y={0}
            width={width - 8}
            height={height}
            fill="#e6f3ff"
            stroke={strokeColor}
            strokeWidth={1}
          />
          {/* Window frame lines */}
          <Line
            points={[width / 2, 0, width / 2, height]}
            stroke={strokeColor}
            strokeWidth={1}
          />
          <Line
            points={[4, height / 2, width - 4, height / 2]}
            stroke={strokeColor}
            strokeWidth={1}
          />
        </Group>
      );

    case 'window-double':
      return (
        <Group>
          {/* Wall sections on sides */}
          <Rect x={0} y={0} width={4} height={height} fill="#1a1a1a" />
          <Rect x={width - 4} y={0} width={4} height={height} fill="#1a1a1a" />
          {/* Center mullion */}
          <Rect x={width / 2 - 2} y={0} width={4} height={height} fill="#1a1a1a" />
          {/* Left glass */}
          <Rect
            x={4}
            y={0}
            width={width / 2 - 6}
            height={height}
            fill="#e6f3ff"
            stroke={strokeColor}
            strokeWidth={1}
          />
          {/* Right glass */}
          <Rect
            x={width / 2 + 2}
            y={0}
            width={width / 2 - 6}
            height={height}
            fill="#e6f3ff"
            stroke={strokeColor}
            strokeWidth={1}
          />
          {/* Frame lines */}
          <Line points={[4, height / 2, width / 2 - 2, height / 2]} stroke={strokeColor} strokeWidth={1} />
          <Line points={[width / 2 + 2, height / 2, width - 4, height / 2]} stroke={strokeColor} strokeWidth={1} />
        </Group>
      );

    case 'room':
    case 'room-living':
    case 'room-kitchen':
    case 'room-bedroom':
    case 'room-bathroom':
    case 'room-hall':
    case 'room-wc':
    case 'room-tech':
      return (
        <Group>
          {/* Room outline with thick walls */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke="#1a1a1a"
            strokeWidth={6}
            fill="rgba(255, 255, 255, 0.3)"
          />
          {/* Room name label */}
          {properties?.name && (
            <>
              <Text
                text={properties.name}
                x={width / 2}
                y={height / 2}
                fontSize={16}
                fontStyle="italic"
                fill="#0088cc"
                align="center"
                verticalAlign="middle"
                offsetX={properties.name.length * 4}
                offsetY={8}
              />
            </>
          )}
        </Group>
      );

    case 'stairs':
      const steps = properties?.steps || 12;
      const stepHeight = height / steps;
      return (
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke={strokeColor}
            strokeWidth={2}
            fill="white"
          />
          {/* Draw steps */}
          {Array.from({ length: steps }).map((_, i) => (
            <Line
              key={i}
              points={[0, i * stepHeight, width, i * stepHeight]}
              stroke={strokeColor}
              strokeWidth={1}
            />
          ))}
          {/* Arrow showing direction */}
          <Line
            points={[width / 2, height - 20, width / 2, 20]}
            stroke="#0088cc"
            strokeWidth={2}
          />
          <Line
            points={[width / 2 - 8, 35, width / 2, 20, width / 2 + 8, 35]}
            stroke="#0088cc"
            strokeWidth={2}
          />
        </Group>
      );

    // ============ LABELS ============
    case 'text-label':
      return (
        <Group>
          <Text
            text={properties?.text || 'Label'}
            fontSize={properties?.fontSize || 14}
            fill={strokeColor}
          />
        </Group>
      );

    case 'circuit-label':
      return (
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke={strokeColor}
            strokeWidth={1}
            fill="white"
          />
          <Text
            text={properties?.circuit || 'A.1'}
            x={4}
            y={4}
            fontSize={12}
            fontStyle="bold"
            fill={strokeColor}
          />
        </Group>
      );

    // Default fallback
    default:
      return (
        <Group>
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="white"
          />
          <Text
            text="?"
            x={width / 2 - 5}
            y={height / 2 - 7}
            fontSize={14}
            fill={strokeColor}
          />
        </Group>
      );
  }
};

export default SymbolRenderer;
