export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Session {
  _id: string;
  date: string;
  hallName: string;
  facultyType: string;
  facultyName: string;
  email: string;
  mobile: string;
  startTime: string;
  endTime: string;
  sessionName: string;
  topicName: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
