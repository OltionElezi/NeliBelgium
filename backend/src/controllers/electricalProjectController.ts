import { Request, Response } from 'express';
import { PrismaClient, DiagramType } from '@prisma/client';
import { generateElectricalPdf } from '../services/electricalPdfService';

const prisma = new PrismaClient();

// Get all electrical projects (optionally filter by clientId)
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const { clientId, includeDeleted } = req.query;

    const projects = await prisma.electricalProject.findMany({
      where: {
        ...(includeDeleted === 'true' ? {} : { deletedAt: null }),
        ...(clientId ? { clientId: parseInt(clientId as string) } : {})
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true
          }
        },
        diagrams: {
          select: {
            id: true,
            name: true,
            type: true,
            pageIndex: true,
            updatedAt: true
          },
          orderBy: { pageIndex: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get electrical projects error:', error);
    res.status(500).json({ error: 'Failed to get electrical projects' });
  }
};

// Get single project by ID with all diagrams
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.electricalProject.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        diagrams: {
          orderBy: { pageIndex: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get electrical project error:', error);
    res.status(500).json({ error: 'Failed to get electrical project' });
  }
};

// Create new electrical project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, clientId, address } = req.body;

    if (!name || !clientId) {
      return res.status(400).json({ error: 'Project name and client are required' });
    }

    // Verify client exists
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const project = await prisma.electricalProject.create({
      data: {
        name,
        description,
        clientId: parseInt(clientId),
        address
      },
      include: {
        client: true,
        diagrams: true
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create electrical project error:', error);
    res.status(500).json({ error: 'Failed to create electrical project' });
  }
};

// Update electrical project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address } = req.body;

    const project = await prisma.electricalProject.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updatedProject = await prisma.electricalProject.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        address
      },
      include: {
        client: true,
        diagrams: true
      }
    });

    res.json(updatedProject);
  } catch (error) {
    console.error('Update electrical project error:', error);
    res.status(500).json({ error: 'Failed to update electrical project' });
  }
};

// Delete electrical project (soft delete)
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.electricalProject.findUnique({
      where: { id: parseInt(id) }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Soft delete
    await prisma.electricalProject.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() }
    });

    res.json({ message: 'Project moved to trash' });
  } catch (error) {
    console.error('Delete electrical project error:', error);
    res.status(500).json({ error: 'Failed to delete electrical project' });
  }
};

// Add diagram to project
export const addDiagram = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, diagramData } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Diagram name and type are required' });
    }

    // Validate diagram type
    if (!Object.values(DiagramType).includes(type)) {
      return res.status(400).json({ error: 'Invalid diagram type' });
    }

    const project = await prisma.electricalProject.findUnique({
      where: { id: parseInt(id) },
      include: { diagrams: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get next page index
    const nextPageIndex = project.diagrams.length;

    // Default empty diagram data structure
    const defaultDiagramData = {
      canvas: {
        width: 1200,
        height: 800,
        gridSize: 20,
        gridVisible: true,
        snapToGrid: true,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        backgroundColor: '#ffffff'
      },
      elements: [],
      connections: [],
      metadata: {
        title: name,
        createdAt: new Date().toISOString()
      }
    };

    const diagram = await prisma.electricalDiagram.create({
      data: {
        projectId: parseInt(id),
        name,
        type: type as DiagramType,
        diagramData: diagramData || defaultDiagramData,
        pageIndex: nextPageIndex
      }
    });

    res.status(201).json(diagram);
  } catch (error) {
    console.error('Add diagram error:', error);
    res.status(500).json({ error: 'Failed to add diagram' });
  }
};

// Update diagram
export const updateDiagram = async (req: Request, res: Response) => {
  try {
    const { id, diagramId } = req.params;
    const { name, diagramData, pageIndex } = req.body;

    const diagram = await prisma.electricalDiagram.findFirst({
      where: {
        id: parseInt(diagramId),
        projectId: parseInt(id)
      }
    });

    if (!diagram) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    const updatedDiagram = await prisma.electricalDiagram.update({
      where: { id: parseInt(diagramId) },
      data: {
        ...(name && { name }),
        ...(diagramData && { diagramData }),
        ...(pageIndex !== undefined && { pageIndex })
      }
    });

    res.json(updatedDiagram);
  } catch (error) {
    console.error('Update diagram error:', error);
    res.status(500).json({ error: 'Failed to update diagram' });
  }
};

// Delete diagram
export const deleteDiagram = async (req: Request, res: Response) => {
  try {
    const { id, diagramId } = req.params;

    const diagram = await prisma.electricalDiagram.findFirst({
      where: {
        id: parseInt(diagramId),
        projectId: parseInt(id)
      }
    });

    if (!diagram) {
      return res.status(404).json({ error: 'Diagram not found' });
    }

    await prisma.electricalDiagram.delete({
      where: { id: parseInt(diagramId) }
    });

    // Reorder remaining diagrams
    const remainingDiagrams = await prisma.electricalDiagram.findMany({
      where: { projectId: parseInt(id) },
      orderBy: { pageIndex: 'asc' }
    });

    // Update page indices
    for (let i = 0; i < remainingDiagrams.length; i++) {
      await prisma.electricalDiagram.update({
        where: { id: remainingDiagrams[i].id },
        data: { pageIndex: i }
      });
    }

    res.json({ message: 'Diagram deleted' });
  } catch (error) {
    console.error('Delete diagram error:', error);
    res.status(500).json({ error: 'Failed to delete diagram' });
  }
};

// Duplicate project
export const duplicateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await prisma.electricalProject.findUnique({
      where: { id: parseInt(id) },
      include: { diagrams: true }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Create new project with copied data
    const newProject = await prisma.electricalProject.create({
      data: {
        name: `${project.name} (Copy)`,
        description: project.description,
        clientId: project.clientId,
        address: project.address,
        diagrams: {
          create: project.diagrams.map(d => ({
            name: d.name,
            type: d.type,
            diagramData: d.diagramData as object,
            pageIndex: d.pageIndex
          }))
        }
      },
      include: {
        client: true,
        diagrams: true
      }
    });

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Duplicate project error:', error);
    res.status(500).json({ error: 'Failed to duplicate project' });
  }
};

// Generate PDF for project
export const getProjectPdf = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get project with all details
    const project = await prisma.electricalProject.findUnique({
      where: { id: parseInt(id) },
      include: {
        client: true,
        diagrams: {
          orderBy: { pageIndex: 'asc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Get company settings
    const company = await prisma.company.findFirst();
    if (!company) {
      return res.status(500).json({ error: 'Company settings not found' });
    }

    // Generate PDF
    const pdfBuffer = await generateElectricalPdf(project, company);

    // Set response headers
    const filename = `electrical-${project.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    console.error('Generate PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
