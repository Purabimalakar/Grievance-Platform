
import React from "react";
import { Calendar, User, Hash } from "lucide-react";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface GrievanceCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  status: "pending" | "in-progress" | "resolved";
  priority: "normal" | "high" | "urgent";
  submittedBy?: string;
  showDetails?: boolean;
}

const GrievanceCard: React.FC<GrievanceCardProps> = ({
  id,
  title,
  description,
  date,
  status,
  priority,
  submittedBy,
  showDetails = true,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
          <div className="flex space-x-2">
            <StatusBadge status={status} />
            <PriorityBadge priority={priority} />
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            {date}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <Hash className="w-4 h-4 mr-1" />
              <span>ID: {id}</span>
            </div>
            
            {submittedBy && (
              <div className="flex items-center text-sm text-gray-500">
                <User className="w-4 h-4 mr-1" />
                <span>{submittedBy}</span>
              </div>
            )}
          </div>
          
          {showDetails && (
            <Link to={`/track-grievance/${id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrievanceCard;
