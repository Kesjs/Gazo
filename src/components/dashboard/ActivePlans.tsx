import { Progress } from '@/components/ui/progress';

const plans = [
  {
    id: 1,
    name: 'Starter Pack',
    amount: 5000,
    dailyProfit: 1.5,
    startDate: '2023-11-01',
    endDate: '2024-02-01',
    progress: 45,
  },
  {
    id: 2,
    name: 'Premium Pack',
    amount: 10000,
    dailyProfit: 2.0,
    startDate: '2023-10-15',
    endDate: '2024-01-15',
    progress: 75,
  },
];

export function ActivePlans() {
  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <div key={plan.id} className="border rounded-lg p-4 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">{plan.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Investissement: {plan.amount.toLocaleString()} €
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rendement quotidien: {plan.dailyProfit}%
              </p>
            </div>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Actif
            </span>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span>
                Début: {new Date(plan.startDate).toLocaleDateString('fr-FR')}
              </span>
              <span>
                Fin: {new Date(plan.endDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <Progress value={plan.progress} className="h-2" />
          </div>
        </div>
      ))}
    </div>
  );
}
