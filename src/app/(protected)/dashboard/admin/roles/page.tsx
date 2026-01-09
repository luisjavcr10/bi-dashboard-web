"use client";

import { useState, useEffect } from "react";
import AdminTable, { Column } from "@/components/admin/AdminTable";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { HiShieldCheck, HiPencil, HiTrash, HiPlus } from "react-icons/hi2";

interface Role {
 id: string;
 name: string;
 description: string;
 permissions: string[];
 createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
 "VIEW_DASHBOARD",
 "VIEW_REPORTS",
 "MANAGE_USERS",
 "MANAGE_ROLES",
];

export default function RolesPage() {
 const [roles, setRoles] = useState<Role[]>([]);
 const [loading, setLoading] = useState(true);
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [editingRole, setEditingRole] = useState<Role | null>(null);

 // Confirm Delete State
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
 const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
 const [isDeleting, setIsDeleting] = useState(false);

 // Form State
 const [isSaving, setIsSaving] = useState(false);
 const [formData, setFormData] = useState({
  name: "",
  description: "",
  permissions: [] as string[],
 });

 const fetchRoles = async () => {
  setLoading(true);
  try {
   const res = await fetch("/api/admin/roles");
   const json = await res.json();
   if (json.data) setRoles(json.data);
  } catch (err) {
   console.error("Error fetching roles:", err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchRoles();
 }, []);

 const handleOpenModal = (role?: Role) => {
  if (role) {
   setEditingRole(role);
   setFormData({
    name: role.name,
    description: role.description || "",
    permissions: role.permissions || [],
   });
  } else {
   setEditingRole(null);
   setFormData({ name: "", description: "", permissions: [] });
  }
  setIsModalOpen(true);
 };

 const confirmDelete = (id: string) => {
  setRoleToDelete(id);
  setIsDeleteModalOpen(true);
 };

 const handleDelete = async () => {
  if (!roleToDelete) return;
  setIsDeleting(true);
  try {
   await fetch(`/api/admin/roles/${roleToDelete}`, { method: "DELETE" });
   fetchRoles();
   setIsDeleteModalOpen(false);
  } catch {
   alert("Error al eliminar rol");
  } finally {
   setIsDeleting(false);
   setRoleToDelete(null);
  }
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSaving(true);
  try {
   const url = editingRole
    ? `/api/admin/roles/${editingRole.id}`
    : "/api/admin/roles";
   const method = editingRole ? "PUT" : "POST";

   const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
   });

   if (res.ok) {
    setIsModalOpen(false);
    fetchRoles();
   } else {
    alert("Error al guardar rol");
   }
  } catch {
   alert("Error al guardar rol");
  } finally {
   setIsSaving(false);
  }
 };

 const togglePermission = (perm: string) => {
  setFormData((prev) => {
   const exists = prev.permissions.includes(perm);
   if (exists) {
    return { ...prev, permissions: prev.permissions.filter((p) => p !== perm) };
   } else {
    return { ...prev, permissions: [...prev.permissions, perm] };
   }
  });
 };

 const columns: Column<Role>[] = [
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  {
   key: "permissions",
   label: "Permisos",
   render: (role) => (
    <div className="flex flex-wrap gap-1">
     {role.permissions?.map((p) => (
      <span
       key={p}
       className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
      >
       {p}
      </span>
     ))}
    </div>
   ),
  },
  {
   key: "actions",
   label: "Acciones",
   align: "right",
   render: (role) => (
    <div className="flex justify-end gap-2">
     <button
      onClick={() => handleOpenModal(role)}
      className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
      title="Editar"
     >
      <HiPencil className="w-4 h-4" />
     </button>
     <button
      onClick={() => confirmDelete(role.id)}
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
    <DashboardHeader title="Gestión de Roles" icon={HiShieldCheck} />
    <button
     onClick={() => handleOpenModal()}
     className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-900/20 font-medium"
    >
     <HiPlus className="w-5 h-5" />
     Nuevo Rol
    </button>
   </div>

   <AdminTable data={roles} columns={columns} isLoading={loading} />

   {/* Create/Edit Modal */}
   <Modal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    title={editingRole ? "Editar Rol" : "Nuevo Rol"}
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
    <form id="roleForm" className="space-y-4">
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
       Descripción
      </label>
      <input
       type="text"
       value={formData.description}
       onChange={(e) =>
        setFormData({ ...formData, description: e.target.value })
       }
       className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
     </div>
     <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
       Permisos
      </label>
      <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-gray-800 rounded-lg border border-gray-700">
       {AVAILABLE_PERMISSIONS.map((perm) => (
        <label key={perm} className="flex items-center gap-2 cursor-pointer">
         <input
          type="checkbox"
          checked={formData.permissions.includes(perm)}
          onChange={() => togglePermission(perm)}
          className="form-checkbox h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 focus:ring-offset-gray-900"
         />
         <span className="text-gray-300 text-sm">{perm}</span>
        </label>
       ))}
      </div>
     </div>
    </form>
   </Modal>

   {/* Confirm Delete Modal */}
   <ConfirmModal
    isOpen={isDeleteModalOpen}
    onClose={() => setIsDeleteModalOpen(false)}
    onConfirm={handleDelete}
    title="Eliminar Rol"
    message="¿Estás seguro de que deseas eliminar este rol? Esta acción no se puede deshacer."
    isLoading={isDeleting}
   />
  </div>
 );
}
