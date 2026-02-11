// API Client pour L'ArtPéro Backend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'MEMBER' | 'ADMIN';
  createdAt: string;
  membership?: Membership;
}

export interface Membership {
  id: string;
  status: 'NONE' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  plan?: string;
  currentPeriodEnd?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location?: string;
  dateStart: string;
  dateEnd?: string;
  capacity?: number;
  isMembersOnly: boolean;
  priceCents: number;
  status: 'DRAFT' | 'PUBLISHED';
  imageUrl?: string;
  registeredCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: 'SUBSCRIPTION' | 'ENTRY' | 'GIFT_CARD';
  priceCents: number;
  durationMonths?: number;
  eventsIncluded?: number;
  isActive: boolean;
  metadata?: Record<string, unknown>;
}

export interface ProductOrder {
  id: string;
  productId?: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  giftCode?: string;
  recipientName?: string;
  recipientEmail?: string;
  expiresAt?: string;
  product?: Product;
  createdAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  totalCents: number;
  status: 'PENDING' | 'PAID' | 'CANCELED';
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    dateStart: string;
    location?: string;
    imageUrl?: string;
    priceCents: number;
  };
}

export interface Order {
  id: string;
  eventId: string;
  userId: string;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  stripeSessionId?: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  ticketCode: string;
  isUsed: boolean;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
    dateStart: string;
    location?: string;
    imageUrl?: string;
  };
}

export interface Testimonial {
  id: string;
  authorName: string;
  content: string;
  isFeatured: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bioMd?: string;
  avatarUrl?: string;
}

// Auth state
let authToken: string | null = localStorage.getItem('auth_token');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return authToken;
}

// API Helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    const result = await apiRequest<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(result.token);
    return result;
  },

  async login(email: string, password: string) {
    const result = await apiRequest<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(result.token);
    return result;
  },

  async logout() {
    setAuthToken(null);
  },

  async getMe() {
    return apiRequest<User>('/auth/me');
  },

  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string }) {
    return apiRequest<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Events API
export const eventsApi = {
  async list() {
    return apiRequest<Event[]>('/events');
  },

  async get(slug: string) {
    return apiRequest<Event>(`/events/${slug}`);
  },

  async register(eventId: string, quantity = 1) {
    return apiRequest(`/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ quantity }),
    });
  },
};

// Products API
export const productsApi = {
  async list() {
    return apiRequest<Product[]>('/products');
  },

  async get(slug: string) {
    return apiRequest<Product>(`/products/${slug}`);
  },

  async checkout(productId: string, quantity = 1, recipientName?: string, recipientEmail?: string) {
    return apiRequest<{ sessionId: string; sessionUrl: string; orderId: string }>('/products/checkout', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, recipientName, recipientEmail }),
    });
  },

  async verifyPayment(orderId: string) {
    return apiRequest<{ success: boolean; order?: ProductOrder }>('/products/verify-payment', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },

  async getOrders() {
    return apiRequest<ProductOrder[]>('/products/orders');
  },
};

// Members API
export const membersApi = {
  async getMembership() {
    return apiRequest<Membership | null>('/members/membership');
  },

  async getTickets() {
    return apiRequest<Ticket[]>('/members/tickets');
  },

  async getRegistrations() {
    return apiRequest<EventRegistration[]>('/members/registrations');
  },

  async getPayments() {
    return apiRequest('/members/payments');
  },

  async redeemGift(giftCode: string) {
    return apiRequest<{ success: boolean; message: string; eventsIncluded: number }>('/members/redeem-gift', {
      method: 'POST',
      body: JSON.stringify({ giftCode }),
    });
  },
};

// Orders API
export const ordersApi = {
  async get(orderId: string) {
    return apiRequest<Order & { event: Event }>(`/orders/${orderId}`);
  },

  async createCheckoutSession(orderId: string) {
    return apiRequest<{ sessionUrl: string }>(`/orders/${orderId}/checkout`, {
      method: 'POST',
    });
  },

  async verifyPayment(orderId: string) {
    return apiRequest<{ success: boolean; paymentStatus: string }>(`/orders/${orderId}/verify`, {
      method: 'POST',
    });
  },
};

// Messages API
export const messagesApi = {
  async send(data: { name: string; email: string; phone?: string; subject?: string; body: string; consent?: boolean }) {
    return apiRequest<{ success: boolean }>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTestimonials() {
    return apiRequest<Testimonial[]>('/messages/testimonials');
  },

  async getTeam() {
    return apiRequest<TeamMember[]>('/messages/team');
  },
};

// Admin Types
export interface AdminDashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
  monthRevenue: number;
  totalRegistrations: number;
  topEvents: Array<{ title: string; registrations: number }>;
}

export interface AdminMember {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  createdAt: string;
  membership?: {
    status: string;
    plan?: string;
    currentPeriodEnd?: string;
  };
}

export interface AdminEvent extends Event {
  registrationsCount: number;
}

export interface AdminPayment {
  id: string;
  userId: string;
  kind: string;
  amountCents: number;
  currency: string;
  status: string;
  createdAt: string;
  user: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
}

// Admin API
export const adminApi = {
  async getDashboard() {
    return apiRequest<AdminDashboardStats>('/admin/dashboard');
  },

  async getMembers() {
    return apiRequest<AdminMember[]>('/admin/members');
  },

  async getEvents() {
    return apiRequest<AdminEvent[]>('/admin/events');
  },

  async createEvent(data: Partial<Event>) {
    return apiRequest<Event>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateEvent(id: string, data: Partial<Event>) {
    return apiRequest<Event>(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteEvent(id: string) {
    return apiRequest<{ success: boolean }>(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  },

  async getPayments(filter?: 'all' | 'subscription' | 'event') {
    const params = filter && filter !== 'all' ? `?kind=${filter}` : '';
    return apiRequest<AdminPayment[]>(`/admin/payments${params}`);
  },

  async getProducts() {
    return apiRequest<Product[]>('/admin/products');
  },

  async createProduct(data: Partial<Product>) {
    return apiRequest<Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, data: Partial<Product>) {
    return apiRequest<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteProduct(id: string) {
    return apiRequest<{ success: boolean }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  },

  async getMessages() {
    return apiRequest<Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      body: string;
      createdAt: string;
    }>>('/admin/messages');
  },
};
