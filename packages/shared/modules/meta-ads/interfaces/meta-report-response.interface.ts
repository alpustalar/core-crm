export interface MetaCampaignSummary {
  campaignId: string;
  campaignName: string;
  spend: number;
  clicks: number;
  cpc: number;
  leads: number;
  conversions: number;
}

export interface MetaReportResponse {
  period: { from: Date; to: Date };
  totalSpend: number;
  totalClicks: number;
  averageCpc: number;
  totalLeads: number;
  convertedLeads: number;
  costPerLead: number;
  costPerAppointment: number;
  conversionRate: number;
  campaigns: MetaCampaignSummary[];
}
