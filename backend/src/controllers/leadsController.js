import { Store } from '../services/store.js';
import { generateCsv, generateExcelBuffer } from '../utils/exportHelper.js';

export async function getLeads(req, res) {
  try {
    const { status, websiteStatus, search } = req.query;
    const leads = await Store.getLeadsByUserId(req.user._id, { status, websiteStatus, search });
    return res.json({ success: true, count: leads.length, leads });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve leads: ' + err.message });
  }
}

export async function createLead(req, res) {
  try {
    const userId = req.user._id;
    const {
      businessName,
      location,
      city,
      category,
      websiteStatus,
      websiteUrl,
      googleMapsUri,
      contactDetails,
      leadStatus = 'New',
      opportunityType,
      estimatedValue,
      notes
    } = req.body;

    if (!businessName) {
      return res.status(400).json({ success: false, message: 'Business name is required' });
    }

    const newLead = await Store.createLead({
      user: userId,
      businessName,
      location: location || '',
      city: city || '',
      category: category || 'General',
      websiteStatus: websiteStatus || 'Website Not Listed',
      websiteUrl: websiteUrl || '',
      googleMapsUri: googleMapsUri || '',
      contactDetails: contactDetails || { phone: '', email: '', contactPerson: '' },
      leadStatus,
      opportunityType: opportunityType || 'New Website Development',
      estimatedValue: estimatedValue || 25000,
      notes: notes || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Business saved as lead successfully',
      lead: newLead
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save lead: ' + err.message });
  }
}

export async function updateLead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const updated = await Store.updateLead(id, userId, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Lead not found or unauthorized' });
    }

    return res.json({
      success: true,
      message: 'Lead updated successfully',
      lead: updated
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update lead: ' + err.message });
  }
}

export async function deleteLead(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deleted = await Store.deleteLead(id, userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Lead not found or unauthorized' });
    }

    return res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete lead: ' + err.message });
  }
}

export async function exportLeads(req, res) {
  try {
    const { format = 'csv' } = req.query;
    const leads = await Store.getLeadsByUserId(req.user._id);

    const exportFields = [
      { label: 'Business Name', key: 'businessName' },
      { label: 'Category', key: 'category' },
      { label: 'Location', key: 'location' },
      { label: 'Website Status', key: 'websiteStatus' },
      { label: 'Website URL', key: 'websiteUrl' },
      { label: 'Lead Status', key: 'leadStatus' },
      { label: 'Opportunity Type', key: 'opportunityType' },
      { label: 'Estimated Value (INR)', key: 'estimatedValue' },
      { label: 'Phone', key: l => l.contactDetails?.phone || '' },
      { label: 'Email', key: l => l.contactDetails?.email || '' },
      { label: 'Contact Person', key: l => l.contactDetails?.contactPerson || '' },
      { label: 'Notes', key: 'notes' },
      { label: 'Created At', key: l => new Date(l.createdAt).toLocaleDateString() }
    ];

    if (format.toLowerCase() === 'xlsx' || format.toLowerCase() === 'excel') {
      const buffer = generateExcelBuffer(leads, exportFields, 'Saved Leads CRM');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bizwebcheck_leads.xlsx"');
      return res.send(buffer);
    }

    const csv = generateCsv(leads, exportFields);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="bizwebcheck_leads.csv"');
    return res.send(csv);

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Export failed: ' + err.message });
  }
}
