export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      chatroom_users: {
        Row: {
          chatroom_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          is_message_seen: boolean;
          user_id: string;
        };
        Insert: {
          chatroom_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_message_seen?: boolean;
          user_id: string;
        };
        Update: {
          chatroom_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          is_message_seen?: boolean;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chatroom_users_chatroom_id_fkey";
            columns: ["chatroom_id"];
            isOneToOne: false;
            referencedRelation: "chatrooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chatroom_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      chatrooms: {
        Row: {
          admin: string;
          created_at: string;
          id: string;
          is_group: boolean;
          last_message: string | null;
        };
        Insert: {
          admin: string;
          created_at?: string;
          id?: string;
          is_group?: boolean;
          last_message?: string | null;
        };
        Update: {
          admin?: string;
          created_at?: string;
          id?: string;
          is_group?: boolean;
          last_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "chatrooms_admin_fkey";
            columns: ["admin"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: {
          chatroom_id: string;
          content: string;
          created_at: string;
          id: string;
          is_image: boolean;
          sender_id: string;
          sender_username: string;
        };
        Insert: {
          chatroom_id: string;
          content: string;
          created_at?: string;
          id?: string;
          is_image?: boolean;
          sender_id: string;
          sender_username: string;
        };
        Update: {
          chatroom_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          is_image?: boolean;
          sender_id?: string;
          sender_username?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_chatroom_id_fkey";
            columns: ["chatroom_id"];
            isOneToOne: false;
            referencedRelation: "chatrooms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: {
          caption: string;
          created_at: string;
          id: string;
          media_name: string;
          media_url: string;
          size: number;
          thumbnail_url: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          caption: string;
          created_at?: string;
          id: string;
          media_name: string;
          media_url: string;
          size: number;
          thumbnail_url?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          caption?: string;
          created_at?: string;
          id?: string;
          media_name?: string;
          media_url?: string;
          size?: number;
          thumbnail_url?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "public_posts_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      searched_users: {
        Row: {
          created_at: string;
          id: string;
          main_user_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          main_user_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          main_user_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "searched_users_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          created_at: string;
          description: string | null;
          email: string;
          first_name: string;
          id: string;
          image_url: string | null;
          last_name: string;
          username: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          email: string;
          first_name: string;
          id?: string;
          image_url?: string | null;
          last_name: string;
          username: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          email?: string;
          first_name?: string;
          id?: string;
          image_url?: string | null;
          last_name?: string;
          username?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_chatroom_id:
        | {
            Args: {
              user_id_1: string;
              user_id_2: string;
            };
            Returns: {
              chatroom_id: string;
            }[];
          }
        | {
            Args: {
              user_ids: string[];
            };
            Returns: {
              chatroom_id: string;
            }[];
          };
      new_message_updater:
        | {
            Args: {
              chatroom_id: string;
              sender_id: string;
            };
            Returns: undefined;
          }
        | {
            Args: {
              last_message: string;
              created_at: string;
              chatroom_id: string;
              sender_id: string;
            };
            Returns: undefined;
          };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never;
