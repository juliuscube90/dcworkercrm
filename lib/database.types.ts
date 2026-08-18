// Hand-written to match the live schema in the connected Supabase project
// (agencies, profiles, clients, opportunities, tasks, client_assignments).
export type AppRole = "owner" | "admin" | "staff" | "client";
export type ClientStatus = "active" | "inactive";
export type OpportunityStage =
  | "New lead"
  | "Contacted"
  | "Qualified"
  | "Proposal Sent"
  | "Won"
  | "Lost";

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      agencies: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id?: string; name: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
        Relationships: Relationship[];
      };
      profiles: {
        Row: {
          id: string;
          agency_id: string | null;
          full_name: string | null;
          role: AppRole;
          created_at: string;
          phone: string | null;
        };
        Insert: {
          id: string;
          agency_id?: string | null;
          full_name?: string | null;
          role?: AppRole;
          created_at?: string;
          phone?: string | null;
        };
        Update: {
          id?: string;
          agency_id?: string | null;
          full_name?: string | null;
          role?: AppRole;
          created_at?: string;
          phone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_agency_id_fkey";
            columns: ["agency_id"];
            isOneToOne: false;
            referencedRelation: "agencies";
            referencedColumns: ["id"];
          },
        ];
      };
      clients: {
        Row: {
          id: string;
          agency_id: string;
          name: string;
          primary_contact: string | null;
          email: string | null;
          phone: string | null;
          status: ClientStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          name: string;
          primary_contact?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: ClientStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          name?: string;
          primary_contact?: string | null;
          email?: string | null;
          phone?: string | null;
          status?: ClientStatus;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clients_agency_id_fkey";
            columns: ["agency_id"];
            isOneToOne: false;
            referencedRelation: "agencies";
            referencedColumns: ["id"];
          },
        ];
      };
      opportunities: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          stage: OpportunityStage;
          value: number;
          assigned_to: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          stage?: OpportunityStage;
          value?: number;
          assigned_to?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          stage?: OpportunityStage;
          value?: number;
          assigned_to?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "opportunities_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "opportunities_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          id: string;
          agency_id: string;
          client_id: string | null;
          title: string;
          due_at: string | null;
          assigned_to: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agency_id: string;
          client_id?: string | null;
          title: string;
          due_at?: string | null;
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agency_id?: string;
          client_id?: string | null;
          title?: string;
          due_at?: string | null;
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_agency_id_fkey";
            columns: ["agency_id"];
            isOneToOne: false;
            referencedRelation: "agencies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      client_assignments: {
        Row: { client_id: string; profile_id: string };
        Insert: { client_id: string; profile_id: string };
        Update: { client_id?: string; profile_id?: string };
        Relationships: [
          {
            foreignKeyName: "client_assignments_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_assignments_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
