import { IssueStatus } from "@/components/civic/StatusBadge";

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'pothole' | 'streetlight' | 'trash' | 'water' | 'other';
  status: IssueStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  reportedBy: string;
  reportedAt: string;
  image?: string;
  verificationCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  department?: string;
  estimatedResolution?: string;
  _id?: string;
  escalated?: boolean;
}

export const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Broken Streetlight',
    description: 'Streetlight has been out for 3 days, creating safety concerns',
    category: 'streetlight',
    status: 'in-progress',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '456 Oak Avenue, Midtown'
    },
    reportedBy: 'Sarah Wilson',
    reportedAt: '2024-01-14T16:45:00Z',
    verificationCount: 12,
    priority: 'medium',
    department: 'Electrical Services',
    estimatedResolution: '2024-01-18'
  },
  {
    id: '2',
    title: 'Overflowing Trash Bin',
    description: 'Public trash bin overflowing for several days, attracting pests',
    category: 'trash',
    status: 'pending',
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: '789 Park Road, Central Park Area'
    },
    reportedBy: 'Mike Chen',
    reportedAt: '2024-01-16T09:15:00Z',
    verificationCount: 3,
    priority: 'medium',
    estimatedResolution: '2024-01-19'
  },
  {
    id: '3',
    title: 'Damaged Sidewalk',
    description: 'Cracked sidewalk creating tripping hazard for pedestrians',
    category: 'other',
    status: 'resolved',
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: '567 Broadway, Theater District'
    },
    reportedBy: 'Alex Thompson',
    reportedAt: '2024-01-10T11:00:00Z',
    verificationCount: 6,
    priority: 'low',
    department: 'Public Works'
  }
];

export const categoryIcons = {
  pothole: '🕳️',
  streetlight: '💡',
  trash: '🗑️',
  water: '💧',
  other: '⚠️'
};

export const departmentColors = {
  'Public Works': 'bg-primary',
  'Electrical Services': 'bg-accent',
  'Water Department': 'bg-secondary',
  'Sanitation': 'bg-muted'
};