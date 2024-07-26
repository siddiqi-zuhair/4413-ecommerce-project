import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
};

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div>
            <p>holy moly</p>
      </div>
    </div>
  );
}
