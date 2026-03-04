"use server";

import { store, ContactRequest } from "@/lib/store";
import { getCurrentUser } from "./auth";
import { nanoid } from "nanoid";

export async function getContactRequests() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return [];
  }

  return store.getContactRequests();
}

export async function createContactRequest(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !subject || !message) {
    return { error: "All fields are required" };
  }

  const user = await getCurrentUser();

  const contact: ContactRequest = {
    id: `contact_${nanoid(8)}`,
    userId: user?.id || null,
    name,
    email,
    subject,
    message,
    status: "PENDING",
    priority: "NORMAL",
    createdAt: new Date().toISOString(),
  };

  store.createContactRequest(contact);
  return { success: true };
}

export async function updateContactStatus(id: string, status: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) {
    return { error: "Unauthorized" };
  }

  store.updateContactRequest(id, { status: status as ContactRequest["status"] });
  return { success: true };
}

export async function getContactStats() {
  const contacts = store.getContactRequests();
  return {
    total: contacts.length,
    pending: contacts.filter((c) => c.status === "PENDING").length,
    resolved: contacts.filter((c) => c.status === "RESOLVED").length,
  };
}
