import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'lartpero-auth',
  },
});

export type Profile = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'member' | 'admin';
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  user_id: string;
  status: 'none' | 'active' | 'canceled' | 'past_due';
  plan: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  date_start: string;
  date_end: string | null;
  capacity: number | null;
  is_members_only: boolean;
  price_cents: number;
  status: 'draft' | 'published';
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'canceled';
  stripe_payment_intent_id: string | null;
  quantity: number;
  total_cents: number;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  author_name: string;
  content: string;
  is_featured: boolean;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio_md: string | null;
  avatar_url: string | null;
  visible: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  body: string;
  consent: boolean;
  read: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  event_id: string;
  user_id: string;
  quantity: number;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Ticket = {
  id: string;
  event_id: string;
  order_id: string;
  user_id: string;
  token: string;
  status: 'valid' | 'used' | 'cancelled';
  used_at: string | null;
  created_at: string;
};
