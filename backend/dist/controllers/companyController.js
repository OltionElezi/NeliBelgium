"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadLogo = exports.updateCompany = exports.getCompany = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getCompany = async (req, res) => {
    try {
        let company = await prisma.company.findFirst();
        if (!company) {
            // Create default company
            company = await prisma.company.create({
                data: {
                    name: 'L&E BOUW CONSTRUTION',
                    ownerName: 'TAULANT KACANI',
                    address: 'Calle altozano numero 12 chaparrel',
                    city: 'MIJAS',
                    region: 'MALAGA',
                    postalCode: '29604',
                    taxId: 'Z1543441P',
                    bankAccount: 'ES5201824290900201606200',
                    bankCode: 'BE 45737066789189',
                    email: 'kacani.vdl@gmail.com',
                    btwNumber: 'BE 0475559227',
                    invoicePrefix: 'FACTURA NR.',
                    nextInvoiceNum: 42
                }
            });
        }
        res.json(company);
    }
    catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({ error: 'Failed to get company' });
    }
};
exports.getCompany = getCompany;
const updateCompany = async (req, res) => {
    try {
        const { name, ownerName, address, city, region, postalCode, taxId, bankAccount, bankCode, email, phone, btwNumber, invoicePrefix } = req.body;
        let company = await prisma.company.findFirst();
        if (!company) {
            company = await prisma.company.create({
                data: {
                    name: name || 'Company Name',
                    ownerName: ownerName || 'Owner Name',
                    address: address || 'Address',
                    city: city || 'City',
                    region: region || 'Region',
                    postalCode: postalCode || '00000',
                    taxId: taxId || '',
                    bankAccount: bankAccount || '',
                    bankCode: bankCode || '',
                    email: email || 'email@example.com',
                    phone,
                    btwNumber,
                    invoicePrefix: invoicePrefix || 'FACTURA NR.'
                }
            });
        }
        else {
            company = await prisma.company.update({
                where: { id: company.id },
                data: {
                    name,
                    ownerName,
                    address,
                    city,
                    region,
                    postalCode,
                    taxId,
                    bankAccount,
                    bankCode,
                    email,
                    phone,
                    btwNumber,
                    invoicePrefix
                }
            });
        }
        res.json(company);
    }
    catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({ error: 'Failed to update company' });
    }
};
exports.updateCompany = updateCompany;
const uploadLogo = async (req, res) => {
    try {
        const { logo } = req.body; // Base64 encoded image
        if (!logo) {
            return res.status(400).json({ error: 'Logo is required' });
        }
        const logoBuffer = Buffer.from(logo, 'base64');
        let company = await prisma.company.findFirst();
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        company = await prisma.company.update({
            where: { id: company.id },
            data: { logo: logoBuffer }
        });
        res.json({ message: 'Logo uploaded successfully' });
    }
    catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
};
exports.uploadLogo = uploadLogo;
//# sourceMappingURL=companyController.js.map