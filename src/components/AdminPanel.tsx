import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { UserAccount } from '../types';

export const AdminPanel: React.FC = () => {
  const { user, isAdmin } = useAppStore();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data) {
        setUsers(data as UserAccount[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        Access Denied
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Master Admin Panel</h1>
      <div className="apple-card p-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-3 text-white/50">ID</th>
                  <th className="pb-3 text-white/50">Email</th>
                  <th className="pb-3 text-white/50">Name</th>
                  <th className="pb-3 text-white/50">Tier</th>
                  <th className="pb-3 text-white/50">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/5">
                    <td className="py-3 text-sm">{u.id}</td>
                    <td className="py-3 text-sm">{u.email}</td>
                    <td className="py-3 text-sm">{u.name}</td>
                    <td className="py-3 text-sm">{u.subscriptionTier || 'FREE'}</td>
                    <td className="py-3">
                      <button className="text-xs px-3 py-1 bg-white/10 rounded-full hover:bg-white/20">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
