"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getAllClients = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getAllClients = async (req, res) => {
    try {
        const { includeDeleted } = req.query;
        const clients = await prisma.client.findMany({
            where: includeDeleted === 'true' ? {} : { deletedAt: null },
            include: {
                invoices: {
                    where: { deletedAt: null },
                    select: {
                        id: true,
                        invoiceNumber: true,
                        total: true,
                        status: true,
                        issueDate: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(clients);
    }
    catch (error) {
        console.error('Get clients error:', error);
        res.status(500).json({ error: 'Failed to get clients' });
    }
};
exports.getAllClients = getAllClients;
const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prisma.client.findUnique({
            where: { id: parseInt(id) },
            include: {
                invoices: {
                    where: { deletedAt: null },
                    include: {
                        items: true
                    },
                    orderBy: { issueDate: 'desc' }
                }
            }
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(client);
    }
    catch (error) {
        console.error('Get client error:', error);
        res.status(500).json({ error: 'Failed to get client' });
    }
};
exports.getClientById = getClientById;
const createClient = async (req, res) => {
    try {
        const { name, email, phone, address, city, country, btwNumber, notes } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Client name is required' });
        }
        const client = await prisma.client.create({
            data: {
                name,
                email,
                phone,
                address,
                city,
                country: country || 'Belgium',
                btwNumber,
                notes
            }
        });
        res.status(201).json(client);
    }
    catch (error) {
        console.error('Create client error:', error);
        res.status(500).json({ error: 'Failed to create client' });
    }
};
exports.createClient = createClient;
const updateClient = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, city, country, btwNumber, notes } = req.body;
        const client = await prisma.client.findUnique({
            where: { id: parseInt(id) }
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        const updatedClient = await prisma.client.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email,
                phone,
                address,
                city,
                country,
                btwNumber,
                notes
            }
        });
        res.json(updatedClient);
    }
    catch (error) {
        console.error('Update client error:', error);
        res.status(500).json({ error: 'Failed to update client' });
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        const client = await prisma.client.findUnique({
            where: { id: parseInt(id) }
        });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        // Soft delete
        await prisma.client.update({
            where: { id: parseInt(id) },
            data: { deletedAt: new Date() }
        });
        res.json({ message: 'Client moved to trash' });
    }
    catch (error) {
        console.error('Delete client error:', error);
        res.status(500).json({ error: 'Failed to delete client' });
    }
};
exports.deleteClient = deleteClient;
//# sourceMappingURL=clientController.js.map