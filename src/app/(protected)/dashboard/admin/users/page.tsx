"use client";

import { useState, useEffect } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { HiUsers, HiPencil, HiTrash, HiPlus } from "react-icons/hi2";

interface User {
 id: string;
 name: string;
 email: string;
 role_id: string;
 role_name: string;
 isActive: boolean;
 createdAt: string;
}

interface Role {
 id: string;
 name: string;
}

export default function UsersPage() {
 const [users, setUsers] = useState<User[]>([]);
 const [roles, setRoles] = useState<Role[]>([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingUser, setEditingUser] = useState<User | null>(null);

 // Confirm Delete State
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [userToDelete, setUserToDelete] = useState<string | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);

 // Form State
 const [isSaving, setIsSaving] = useState(false);
 const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  role_id: "",
  isActive: true,
 });

 const fetchData = async () => {
  setLoading(true);
  try {
   const [usersRes, rolesRes] = await Promise.all([
    fetch("/api/admin/users"),
    fetch("/api/admin/roles"),
   ]);
   const usersJson = await usersRes.json();
   const rolesJson = await rolesRes.json();

   if (usersJson.data) setUsers(usersJson.data);
   if (rolesJson.data) setRoles(rolesJson.data);
  } catch (err) {
   console.error("Error fetching data:", err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchData();
 }, []);

 const handleOpenModal = (user?: User) => {
  if (user) {
   setEditingUser(user);
   setFormData({
    name: user.name,
    email: user.email,
    password: "", // Passwords are not fetched back
    role_id: user.role_id,
    isActive: user.isActive,
   });
  } else {
   setEditingUser(null);
   setFormData({
    name: "",
    email: "",
    password: "",
    role_id: roles[0]?.id || "",
    isActive: true,
   });
  }
  setIsModalOpen(true);
 };

 const confirmDelete = (id: string) => {
  setUserToDelete(id);
  setIsDeleteModalOpen(true);
 };

 const handleDelete = async () => {
  if (!userToDelete) return;
  setIsDeleting(true);
  try {
   await fetch(`/api/admin/users/${userToDelete}`, { method: "DELETE" });
   fetchData();
   setIsDeleteModalOpen(false);
  } catch {
   alert("Error al eliminar usuario");
  } finally {
   setIsDeleting(false);
   setUserToDelete(null);
  }
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);
  try {
   const url = editingUser
    ? `/api/admin/users/${editingUser.id}`
    : "/api/admin/users";
   const method = editingUser ? "PUT" : "POST";

   const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
   });

   if (res.ok) {
    setIsModalOpen(false);
    fetchData();
   } else {
    const json = await res.json();
    alert(json.error || "Error al guardar usuario");
   }
  } catch {
   alert("Error al guardar usuario");
  } finally {
   setIsSaving(false);
  }
 };

 const columns: Column<User>[] = [
  { key: "name", label: "Nombre" },
  { key: "email", label: "Email" },
  {
   key: "role_name",
   label: "Rol",
   render: (user) => (
    <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-300 border border-gray-600 font-medium">
     {user.role_name || "Desconocido"}
    </span>
   ),
  },
  {
   key: "isActive",
   label: "Estado",
   align: "center",
   render: (user) => (
    <span
     className={`px-2 py-0.5 text-xs rounded-full border ${
      user.isActive
       ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
       : "bg-red-500/20 text-red-300 border-red-500/30"
     }`}
    >
     {user.isActive ? "Activo" : "Inactivo"}
    </span>
   ),
  },
  {
   key: "actions",
   label: "Acciones",
   align: "right",
   render: (user) => (
    <div className="flex justify-end gap-2">
     <button
      onClick={() => handleOpenModal(user)}
      className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
      title="Editar"
     >
      <HiPencil className="w-4 h-4" />
     </button>
     <button
      onClick={() => confirmDelete(user.id)}
      className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
      title="Eliminar"
     >
      <HiTrash className="w-4 h-4" />
     </button>
    </div>
   ),
  },
 ];

 return (
  <div className="p-6 space-y-6">
   <div className="flex items-center justify-between">
    <DashboardHeader title="Gestión de Usuarios" icon={HiUsers} />
    <button
     onClick={() => handleOpenModal()}
     className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20 font-medium"
    >
     <HiPlus className="w-5 h-5" />
     Nuevo Usuario
    </button>
   </div>

   <AdminTable data={users} columns={columns} isLoading={loading} />

   {/* Create/Edit Modal */}
   <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title={editingUser ? "Editar Usuario" : "Nuevo Usuario"}
    footer={
     <>
      <button
       type="button"
       onClick={() => setIsModalOpen(false)}
       className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
       disabled={isSaving}
      >
       Cancelar
      </button>
      <button
       onClick={(e) => handleSubmit(e)}
       disabled={isSaving}
       className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-indigo-900/20 flex items-center gap-2"
      >
       {isSaving && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
       )}
       Guardar
      </button>
     </>
    }
   >
    <form id="userForm" className="space-y-4">
     <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
       Nombre
      </label>
      <input
       type="text"
       value={formData.name}
       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
       required
      />
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
       Email
      </label>
      <input
       type="email"
       value={formData.email}
       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
       required
      />
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
       Contraseña{" "}
       {editingUser && (
        <span className="text-gray-500 text-xs">
         (Dejar en blanco para mantener)
        </span>
       )}
      </label>
      <input
       type="password"
       value={formData.password}
       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
       required={!editingUser}
       minLength={6}
      />
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-300 mb-1">
       Rol
      </label>
      <select
       value={formData.role_id}
       onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
       required
      >
       <option value="">Seleccionar rol...</option>
       {roles.map((role) => (
        <option key={role.id} value={role.id}>
         {role.name}
        </option>
       ))}
      </select>
     </div>
     <div className="flex items-center gap-2">
      <input
       type="checkbox"
       id="isActive"
       checked={formData.isActive}
       onChange={(e) =>
        setFormData({ ...formData, isActive: e.target.checked })
       }
       className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-offset-gray-900"
      />
      <label
       htmlFor="isActive"
       className="text-sm font-medium text-gray-300 cursor-pointer"
      >
       Usuario Activo
      </label>
     </div>
    </form>
   </Modal>

   {/* Confirm Delete Modal */}
   <ConfirmModal
    isOpen={isDeleteModalOpen}
    onClose={() => setIsDeleteModalOpen(false)}
    onConfirm={handleDelete}
    title="Eliminar Usuario"
    message="¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer."
    isLoading={isDeleting}
   />
  </div>
 );
}
