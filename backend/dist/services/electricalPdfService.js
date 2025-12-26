"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateElectricalPdf = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Symbol rendering functions for PDF
const symbolRenderers = {
    // Outlets
    'outlet-single': (doc, x, y, size) => {
        doc.circle(x, y, size / 2).stroke();
        doc.moveTo(x - size / 4, y).lineTo(x + size / 4, y).stroke();
    },
    'outlet-double': (doc, x, y, size) => {
        doc.circle(x, y, size / 2).stroke();
        doc.moveTo(x - size / 4, y - 3).lineTo(x + size / 4, y - 3).stroke();
        doc.moveTo(x - size / 4, y + 3).lineTo(x + size / 4, y + 3).stroke();
    },
    'outlet-grounded': (doc, x, y, size) => {
        doc.circle(x, y, size / 2).stroke();
        doc.moveTo(x - size / 4, y).lineTo(x + size / 4, y).stroke();
        // Ground symbol
        doc.moveTo(x, y + size / 4).lineTo(x, y + size / 2 + 2).stroke();
        doc.moveTo(x - 4, y + size / 2 + 2).lineTo(x + 4, y + size / 2 + 2).stroke();
    },
    // Switches
    'switch-single': (doc, x, y, size) => {
        doc.circle(x - size / 4, y, 2).fill('#000');
        doc.moveTo(x - size / 4, y).lineTo(x + size / 4, y - size / 4).stroke();
    },
    'switch-double': (doc, x, y, size) => {
        doc.circle(x - size / 4, y, 2).fill('#000');
        doc.moveTo(x - size / 4, y).lineTo(x + size / 4, y - size / 4).stroke();
        doc.fontSize(6).text('2', x + size / 4 + 2, y - size / 4 - 3);
    },
    'switch-dimmer': (doc, x, y, size) => {
        doc.circle(x - size / 4, y, 2).fill('#000');
        doc.moveTo(x - size / 4, y).lineTo(x + size / 4, y - size / 4).stroke();
        // Dimmer arrow
        doc.moveTo(x + size / 4 - 4, y - size / 4 + 2).lineTo(x + size / 4 + 4, y - size / 4 - 4).stroke();
    },
    // Lighting
    'light-ceiling': (doc, x, y, size) => {
        doc.circle(x, y, size / 2).stroke();
        doc.moveTo(x - size / 3, y - size / 3).lineTo(x + size / 3, y + size / 3).stroke();
        doc.moveTo(x + size / 3, y - size / 3).lineTo(x - size / 3, y + size / 3).stroke();
    },
    'light-wall': (doc, x, y, size) => {
        doc.circle(x, y, size / 2).stroke();
        doc.moveTo(x - size / 3, y - size / 3).lineTo(x + size / 3, y + size / 3).stroke();
        doc.moveTo(x + size / 3, y - size / 3).lineTo(x - size / 3, y + size / 3).stroke();
        // Wall indicator
        doc.rect(x - size / 2, y - size / 2 - 4, size, 4).fill('#000');
    },
    'light-spot': (doc, x, y, size) => {
        doc.circle(x, y, size / 3).fill('#000');
        doc.circle(x, y, size / 2).stroke();
    },
    // Distribution
    'breaker-main': (doc, x, y, size) => {
        doc.rect(x - size / 2, y - size / 3, size, size * 0.66).stroke();
        doc.fontSize(6).text('MAIN', x - size / 3, y - 3);
    },
    'breaker-rcd': (doc, x, y, size) => {
        doc.rect(x - size / 2, y - size / 3, size, size * 0.66).stroke();
        doc.fontSize(5).text('30mA', x - size / 3, y - 3);
    },
    'breaker-circuit': (doc, x, y, size) => {
        doc.rect(x - size / 4, y - size / 3, size / 2, size * 0.66).stroke();
    },
    // Wiring
    'junction-box': (doc, x, y, size) => {
        doc.circle(x, y, size / 3).fill('#000');
    },
    // Structure
    'wall': (doc, x, y, size, props) => {
        const width = props?.width || size * 2;
        const height = props?.height || 4;
        doc.rect(x - width / 2, y - height / 2, width, height).fill('#333');
    },
    'room': (doc, x, y, size, props) => {
        const width = props?.width || size * 3;
        const height = props?.height || size * 2;
        doc.rect(x, y, width, height).stroke();
        if (props?.name) {
            doc.fontSize(8).text(props.name, x + 5, y + 5);
        }
    },
    'door': (doc, x, y, size) => {
        doc.moveTo(x, y).lineTo(x + size, y).stroke();
        // Door swing arc - approximate with bezier curve
        doc.moveTo(x + size, y);
        doc.bezierCurveTo(x + size, y + size * 0.55, x + size * 0.55, y + size, x, y + size);
        doc.stroke();
    },
    'window': (doc, x, y, size) => {
        doc.rect(x, y - 2, size, 4).stroke();
        doc.moveTo(x + size / 3, y - 2).lineTo(x + size / 3, y + 2).stroke();
        doc.moveTo(x + size * 2 / 3, y - 2).lineTo(x + size * 2 / 3, y + 2).stroke();
    },
    // Labels
    'text-label': (doc, x, y, size, props) => {
        const text = props?.text || 'Label';
        const fontSize = props?.fontSize || 10;
        doc.fontSize(fontSize).text(text, x, y);
    },
    'circuit-label': (doc, x, y, size, props) => {
        const label = props?.circuitNumber || 'C1';
        doc.circle(x, y, size / 3).stroke();
        doc.fontSize(6).text(label, x - size / 4, y - 3);
    }
};
// Default renderer for unknown symbols
const defaultRenderer = (doc, x, y, size) => {
    doc.rect(x - size / 2, y - size / 2, size, size).stroke();
    doc.fontSize(6).text('?', x - 2, y - 3);
};
const getDiagramTypeLabel = (type) => {
    switch (type) {
        case 'FLOOR_PLAN': return 'Gelijkvloers';
        case 'DISTRIBUTION_BOARD': return 'Verdeelbord';
        case 'CIRCUIT': return 'Stroomschema';
        default: return type;
    }
};
const generateElectricalPdf = async (project, company) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({
                size: 'A4',
                layout: 'landscape',
                margin: 40,
                info: {
                    Title: `Electrical Project - ${project.name}`,
                    Author: company.name,
                    Subject: `Electrical diagrams for ${project.client.name}`
                }
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const pageWidth = doc.page.width - 80;
            const pageHeight = doc.page.height - 80;
            // Cover page
            drawCoverPage(doc, project, company, pageWidth, pageHeight);
            // Diagram pages
            for (let i = 0; i < project.diagrams.length; i++) {
                const diagram = project.diagrams[i];
                doc.addPage({ layout: 'landscape' });
                drawDiagramPage(doc, diagram, project, company, pageWidth, pageHeight, i + 1, project.diagrams.length);
            }
            // Legend page
            doc.addPage({ layout: 'landscape' });
            drawLegendPage(doc, company, pageWidth, pageHeight, project.diagrams.length + 1);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
exports.generateElectricalPdf = generateElectricalPdf;
function drawCoverPage(doc, project, company, pageWidth, pageHeight) {
    // Company logo
    const logoPath = path_1.default.join(process.cwd(), 'src', 'image-removebg-preview (1).png');
    if (fs_1.default.existsSync(logoPath)) {
        doc.image(logoPath, 40, 30, { width: 100 });
    }
    // Company name
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .text(company.name, 160, 40);
    doc.fontSize(10)
        .font('Helvetica')
        .text(company.address, 160, 60)
        .text(`${company.city}, ${company.postalCode}`, 160, 75)
        .text(`Tel: ${company.phone || ''}`, 160, 90)
        .text(`Email: ${company.email}`, 160, 105);
    // Title
    doc.fontSize(28)
        .font('Helvetica-Bold')
        .text('ELEKTRISCH SCHEMA', 40, 180, { align: 'center', width: pageWidth });
    // Project name
    doc.fontSize(20)
        .font('Helvetica')
        .text(project.name, 40, 230, { align: 'center', width: pageWidth });
    // Project address
    if (project.address) {
        doc.fontSize(14)
            .text(project.address, 40, 260, { align: 'center', width: pageWidth });
    }
    // Client info box
    const boxY = 320;
    doc.rect(40, boxY, pageWidth, 100).stroke();
    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('KLANT GEGEVENS', 50, boxY + 10);
    doc.fontSize(10)
        .font('Helvetica')
        .text(`Naam: ${project.client.name}`, 50, boxY + 35)
        .text(`Adres: ${project.client.address || '-'}`, 50, boxY + 50)
        .text(`Stad: ${project.client.city || '-'}`, 50, boxY + 65)
        .text(`Tel: ${project.client.phone || '-'}`, 50, boxY + 80);
    if (project.client.email) {
        doc.text(`Email: ${project.client.email}`, 300, boxY + 35);
    }
    if (project.client.btwNumber) {
        doc.text(`BTW: ${project.client.btwNumber}`, 300, boxY + 50);
    }
    // Diagram list
    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('INHOUD', 50, 450);
    project.diagrams.forEach((diagram, index) => {
        doc.fontSize(10)
            .font('Helvetica')
            .text(`${index + 1}. ${diagram.name} (${getDiagramTypeLabel(diagram.type)})`, 60, 475 + index * 18);
    });
    // Date
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    doc.fontSize(10)
        .text(`Datum: ${dateStr}`, 40, pageHeight + 20, { align: 'right', width: pageWidth });
}
function drawDiagramPage(doc, diagram, project, company, pageWidth, pageHeight, pageNum, totalDiagrams) {
    // Header
    doc.fontSize(10)
        .font('Helvetica')
        .text(company.name, 40, 25)
        .text(project.name, 40, 25, { align: 'center', width: pageWidth });
    // Diagram title
    doc.fontSize(14)
        .font('Helvetica-Bold')
        .text(`${diagram.name} - ${getDiagramTypeLabel(diagram.type)}`, 40, 50);
    // Diagram area
    const diagramAreaTop = 75;
    const diagramAreaHeight = pageHeight - 50;
    const diagramAreaWidth = pageWidth;
    // Draw border
    doc.rect(40, diagramAreaTop, diagramAreaWidth, diagramAreaHeight).stroke();
    // Parse and render diagram data
    const diagramData = diagram.diagramData;
    if (diagramData && diagramData.elements) {
        const scale = calculateScale(diagramData.canvas, diagramAreaWidth, diagramAreaHeight);
        const offsetX = 40 + (diagramAreaWidth - diagramData.canvas.width * scale) / 2;
        const offsetY = diagramAreaTop + (diagramAreaHeight - diagramData.canvas.height * scale) / 2;
        // Draw connections (wires)
        if (diagramData.connections) {
            doc.strokeColor('#333').lineWidth(1);
            for (const conn of diagramData.connections) {
                if (conn.points && conn.points.length >= 4) {
                    doc.moveTo(offsetX + conn.points[0] * scale, offsetY + conn.points[1] * scale);
                    for (let i = 2; i < conn.points.length; i += 2) {
                        doc.lineTo(offsetX + conn.points[i] * scale, offsetY + conn.points[i + 1] * scale);
                    }
                    if (conn.dashed) {
                        doc.dash(5, { space: 3 });
                    }
                    doc.stroke();
                    doc.undash();
                }
            }
        }
        // Draw elements
        doc.strokeColor('#000').lineWidth(1);
        for (const element of diagramData.elements) {
            const x = offsetX + element.x * scale;
            const y = offsetY + element.y * scale;
            const size = Math.min(element.width, element.height) * scale;
            const renderer = symbolRenderers[element.type] || defaultRenderer;
            doc.save();
            if (element.rotation) {
                doc.translate(x, y);
                doc.rotate(element.rotation);
                doc.translate(-x, -y);
            }
            renderer(doc, x, y, size, element.properties);
            doc.restore();
        }
    }
    // Footer
    doc.fontSize(8)
        .font('Helvetica')
        .text(`Pagina ${pageNum + 1} van ${totalDiagrams + 2}`, 40, pageHeight + 35, {
        align: 'center',
        width: pageWidth
    });
}
function drawLegendPage(doc, company, pageWidth, pageHeight, pageNum) {
    // Title
    doc.fontSize(16)
        .font('Helvetica-Bold')
        .text('LEGENDE - ELEKTRISCHE SYMBOLEN', 40, 40);
    const symbolSize = 20;
    const colWidth = pageWidth / 3;
    const rowHeight = 40;
    let col = 0;
    let row = 0;
    const legendItems = [
        { type: 'outlet-single', label: 'Stopcontact enkel' },
        { type: 'outlet-double', label: 'Stopcontact dubbel' },
        { type: 'outlet-grounded', label: 'Stopcontact geaard' },
        { type: 'switch-single', label: 'Schakelaar enkel' },
        { type: 'switch-double', label: 'Schakelaar dubbel' },
        { type: 'switch-dimmer', label: 'Dimmer' },
        { type: 'light-ceiling', label: 'Plafondlamp' },
        { type: 'light-wall', label: 'Wandlamp' },
        { type: 'light-spot', label: 'Spot' },
        { type: 'breaker-main', label: 'Hoofdschakelaar' },
        { type: 'breaker-rcd', label: 'Differentieelschakelaar 30mA' },
        { type: 'breaker-circuit', label: 'Automaat' },
        { type: 'junction-box', label: 'Aftakdoos' },
    ];
    const startY = 80;
    for (const item of legendItems) {
        const x = 60 + col * colWidth;
        const y = startY + row * rowHeight;
        // Draw symbol
        const renderer = symbolRenderers[item.type] || defaultRenderer;
        doc.strokeColor('#000').lineWidth(1);
        renderer(doc, x + symbolSize / 2, y + symbolSize / 2, symbolSize, {});
        // Draw label
        doc.fontSize(9)
            .font('Helvetica')
            .fillColor('#000')
            .text(item.label, x + symbolSize + 10, y + 5, { width: colWidth - symbolSize - 20 });
        col++;
        if (col >= 3) {
            col = 0;
            row++;
        }
    }
    // Wire types legend
    const wireY = startY + (row + 2) * rowHeight;
    doc.fontSize(12)
        .font('Helvetica-Bold')
        .text('BEDRADING', 60, wireY);
    doc.fontSize(9)
        .font('Helvetica');
    // Solid line
    doc.moveTo(60, wireY + 30).lineTo(120, wireY + 30).stroke();
    doc.text('Zichtbare bedrading', 130, wireY + 25);
    // Dashed line
    doc.dash(5, { space: 3 });
    doc.moveTo(60, wireY + 55).lineTo(120, wireY + 55).stroke();
    doc.undash();
    doc.text('Ingebouwde bedrading', 130, wireY + 50);
    // Footer
    doc.fontSize(8)
        .text(`${company.name} - Elektrische Installatie`, 40, pageHeight + 35, { align: 'left' })
        .text(`Pagina ${pageNum + 1}`, 40, pageHeight + 35, { align: 'right', width: pageWidth });
}
function calculateScale(canvas, maxWidth, maxHeight) {
    const scaleX = maxWidth / canvas.width;
    const scaleY = maxHeight / canvas.height;
    return Math.min(scaleX, scaleY, 1) * 0.9; // 90% to leave some margin
}
//# sourceMappingURL=electricalPdfService.js.map