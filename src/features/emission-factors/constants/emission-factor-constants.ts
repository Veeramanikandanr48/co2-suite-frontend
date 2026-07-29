export const CATEGORY_OPTIONS = [
  'Stationary Combustion',
  'Mobile Combustion',
  'Fugitive Emissions',
  'Process Emissions',
  'Purchased Electricity',
  'Purchased Heating & Steam',
  'Purchased Goods and Services',
  'Capital Goods',
  'Energy and Fuel Related Activities',
  'Upstream Transportation',
  'Waste Generated in Operations',
  'Business Travel',
  'Employee Commuting',
  'Downstream Transportation',
  'Processing of Sold Products',
  'Use of Sold Products',
  'EOL Treatment of Sold Products',
  'Franchise',
  'Investments',
];

export const CATEGORY_VARIABLE_MAP: Record<string, { name: string; color: string }[]> = {
  'Stationary Combustion': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Mobile Combustion': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Fugitive Emissions': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'leakage', color: 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100' },
  ],
  'Process Emissions': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Purchased Electricity': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Purchased Heating & Steam': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Purchased Goods and Services': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Capital Goods': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Energy and Fuel Related Activities': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Upstream Transportation': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Downstream Transportation': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Waste Generated in Operations': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
  ],
  'Business Travel': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { name: 'people', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
    { name: 'rooms', color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' },
    { name: 'nights', color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100' },
  ],
  'Employee Commuting': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'distance', color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' },
    { name: 'people', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
  ],
  'Processing of Sold Products': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Use of Sold Products': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'EOL Treatment of Sold Products': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Franchise': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  ],
  'Investments': [
    { name: 'amount', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
    { name: 'factor', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
    { name: 'scope1', color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100' },
    { name: 'scope2', color: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' },
    { name: 'equityShare', color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100' },
  ],
};
