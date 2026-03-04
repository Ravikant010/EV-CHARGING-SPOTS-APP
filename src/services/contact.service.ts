import { store, type ContactRequest } from "@/lib/store";
import { nanoid } from "nanoid";

export interface ContactInput {
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function createContact(data: ContactInput): Promise<string> {
  const id = `contact_${nanoid(8)}`;
  const contact: ContactRequest = {
    id,
    userId: data.userId || null,
    name: data.name,
    email: data.email,
    subject: data.subject,
    message: data.message,
    status: "PENDING",
    priority: "NORMAL",
    createdAt: new Date().toISOString(),
  };

  store.createContactRequest(contact);
  return id;
}

export async function getContactRequests(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<ContactRequest[]> {
  let contacts = store.getContactRequests();

  if (options?.status) {
    contacts = contacts.filter((c) => c.status === options.status);
  }

  // Sort by createdAt descending
  contacts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return contacts.slice(offset, offset + limit);
}

export async function getContactById(id: string): Promise<ContactRequest | undefined> {
  return store.getContactRequestById(id);
}

export async function updateContactStatus(
  id: string,
  status: ContactRequest["status"],
  response?: string
): Promise<boolean> {
  try {
    const updateData: Partial<ContactRequest> = { status };
    // Note: our store doesn't have response field, but we could add it

    const result = store.updateContactRequest(id, updateData);
    return !!result;
  } catch {
    return false;
  }
}

export async function getContactStats(): Promise<{
  total: number;
  pending: number;
  resolved: number;
}> {
  const contacts = store.getContactRequests();
  return {
    total: contacts.length,
    pending: contacts.filter((c) => c.status === "PENDING").length,
    resolved: contacts.filter((c) => c.status === "RESOLVED").length,
  };
}
