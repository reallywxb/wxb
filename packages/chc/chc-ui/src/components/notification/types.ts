interface NotificationItem {
  avatar: string;
  date: string;
  id: number | string;
  isRead?: boolean;
  message: string;
  title: string;
}

export type { NotificationItem };
