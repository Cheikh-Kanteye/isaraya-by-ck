import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTable } from "../shared/DataTable";
import { columns } from "./users/columns";
import { FilterBar, FilterState } from "../shared/FilterBar";
import { Pagination } from "../shared/Pagination";
import { Table as TanstackTable } from "@tanstack/react-table";
import { Shield, Trash2 } from "lucide-react";
import { useUsers } from "@/hooks/queries";
import type { User } from "@/types";
import { useLocation, useNavigate } from "react-router-dom";
import UserDetailsSidebar from "./users/UserDetailsSidebar";
import { UserFormDialog } from "./users/UserFormDialog";
import * as z from "zod";

const formSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["ADMIN", "CLIENT", "MERCHANT"]),
});

const UsersManagement = () => {
  const { data: users, isLoading, error } = useUsers();
  const location = useLocation();
  const navigate = useNavigate();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(
    null
  );

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: [], // This will be ignored by FilterBar if no statusOptions are provided
    category: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, itemsPerPage]);

  const selectedUserId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("userId");
  }, [location.search]);

  const selectedUser = useMemo(() => {
    if (!selectedUserId || !users) return null;
    return users.find((user) => user.id === selectedUserId) || null;
  }, [selectedUserId, users]);

  const handleCloseSidebar = () => {
    navigate(location.pathname, { replace: true });
  };

  const handleOpenForm = (user: User | null = null) => {
    setSelectedUserForEdit(user);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedUserForEdit(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    console.log("Form values:", values);
    // Simuler un appel API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log(
      selectedUserForEdit ? "Utilisateur mis à jour !" : "Utilisateur créé !"
    );
    setIsSubmitting(false);
    handleCloseForm();
    // Ici, vous appelleriez votre mutation React Query pour mettre à jour les données
  };

  const handleDeleteSelected = (table: TanstackTable<User>) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const numSelected = selectedRows.length;

    if (numSelected === 0) return;

    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer ${numSelected} utilisateur(s) ?`
      )
    ) {
      const selectedIds = selectedRows.map((row) => row.original.id);
      console.log("Deleting users:", selectedIds);
      // Ici, vous appelleriez votre mutation de suppression
      // ex: deleteUsersMutation.mutate(selectedIds);
      table.resetRowSelection();
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const searchMatch =
        filters.search === "" ||
        `${user.firstname || ""} ${user.lastname || ""}`
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      const roleMatch =
        filters.category === "" || user.role === filters.category;
      return searchMatch && roleMatch;
    });
  }, [users, filters]);

  const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

  const renderUserActions = (table: TanstackTable<User>) => (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline" className="glass-card">
        <Shield className="mr-2 h-4 w-4" />
        Changer le statut ({table.getFilteredSelectedRowModel().rows.length})
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => handleDeleteSelected(table)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Supprimer ({table.getFilteredSelectedRowModel().rows.length})
      </Button>
    </div>
  );

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur de chargement des utilisateurs.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Gestion des utilisateurs
        </h1>
        <p className="text-muted-foreground">
          Gérez les comptes, les rôles et les permissions
        </p>
      </div>

      <Card className="glass-card-2">
        <CardHeader className="border-b">
          <CardTitle className="text-muted-foreground">Utilisateurs</CardTitle>
          <CardDescription className="text-foreground">
            Liste de tous les utilisateurs de la plateforme
          </CardDescription>
          <div className="flex items-end gap-3">
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              categoryLabel="Rôle"
              categoryOptions={[
                { value: "ADMIN", label: "Admin" },
                { value: "MERCHANT", label: "Merchant" },
                { value: "CLIENT", label: "Client" },
              ]}
            />
            <Button onClick={() => handleOpenForm()}>
              Ajouter un utilisateur
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={columns}
            data={filteredUsers}
            pageSize={itemsPerPage}
            pageCount={pageCount}
            pageIndex={currentPage - 1}
            renderRowSelectionActions={renderUserActions}
          />
          <div className="border-t p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={pageCount}
              totalItems={filteredUsers.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page: number) => setCurrentPage(page)}
              onItemsPerPageChange={(items: number) => setItemsPerPage(items)}
            />
          </div>
        </CardContent>
      </Card>

      <UserDetailsSidebar
        user={selectedUser}
        onClose={handleCloseSidebar}
        onEdit={() => handleOpenForm(selectedUser)}
      />

      <UserFormDialog
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        user={selectedUserForEdit}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default UsersManagement;
