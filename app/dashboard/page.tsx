import { auth, signOut } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {session?.user?.name || session?.user?.email}
          </span>
          <form
            action={async () => {
              'use server';
              await signOut();
            }}
          >
            <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
              Sign Out
            </button>
          </form>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium">Total Sales</h3>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h3 className="text-lg font-medium">Active Orders</h3>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
      </div>
    </div>
  );
}
