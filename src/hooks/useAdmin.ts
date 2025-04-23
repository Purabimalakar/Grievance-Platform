import { useState } from 'react';
import { ref, get, update, set, remove, query, orderByChild, equalTo } from 'firebase/database';
import { rtdb } from '@/config/firebase';
import { Grievance } from '@/types/grievance';

// Admin credentials hard-coded for direct access
export const ADMIN_CREDENTIALS = {
  email: "admin@raisevoice.com",
  password: "Admin@123"
};

export function useAdmin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create admin user in the database
  const createAdminUser = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update user record to mark as admin
      const userRef = ref(rtdb, `users/${userId}`);
      await update(userRef, {
        isAdmin: true,
        role: 'admin'
      });
      
      return true;
    } catch (err) {
      console.error('Error creating admin user:', err);
      setError('Failed to create admin user');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get all grievances
  const getAllGrievances = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const grievancesRef = ref(rtdb, 'grievances');
      const snapshot = await get(grievancesRef);
      
      if (snapshot.exists()) {
        const grievancesData = snapshot.val();
        return Object.keys(grievancesData).map(key => ({
          id: key,
          ...grievancesData[key]
        })) as Grievance[];
      }
      
      return [];
    } catch (err) {
      console.error('Error getting grievances:', err);
      setError('Failed to fetch grievances');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get grievances by status
  const getGrievancesByStatus = async (status: 'pending' | 'in-progress' | 'resolved') => {
    try {
      setLoading(true);
      setError(null);
      
      const grievancesRef = ref(rtdb, 'grievances');
      const statusQuery = query(grievancesRef, orderByChild('status'), equalTo(status));
      const snapshot = await get(statusQuery);
      
      if (snapshot.exists()) {
        const grievancesData = snapshot.val();
        return Object.keys(grievancesData).map(key => ({
          id: key,
          ...grievancesData[key]
        })) as Grievance[];
      }
      
      return [];
    } catch (err) {
      console.error(`Error getting ${status} grievances:`, err);
      setError(`Failed to fetch ${status} grievances`);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update grievance status
  const updateGrievanceStatus = async (
    grievanceId: string, 
    status: 'pending' | 'in-progress' | 'resolved',
    adminComment?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const grievanceRef = ref(rtdb, `grievances/${grievanceId}`);
      const grievanceSnapshot = await get(grievanceRef);
      
      if (!grievanceSnapshot.exists()) {
        throw new Error('Grievance not found');
      }
      
      const updateData: any = {
        status,
        lastUpdated: new Date().toISOString()
      };
      
      // Add comment if provided
      if (adminComment) {
        const grievanceData = grievanceSnapshot.val();
        const comments = grievanceData.comments || [];
        
        comments.push({
          id: Date.now().toString(),
          text: adminComment,
          date: new Date().toISOString(),
          userId: 'admin',
          userName: 'Admin'
        });
        
        updateData.comments = comments;
      }
      
      await update(grievanceRef, updateData);
      
      // Create notification for the user
      const grievanceData = grievanceSnapshot.val();
      const userId = grievanceData.submittedBy;
      
      if (userId) {
        const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
        await set(notificationRef, {
          type: 'grievance_update',
          message: `Your grievance (ID: ${grievanceId}) status has been updated to ${status}.`,
          date: new Date().toISOString(),
          grievanceId,
          read: false
        });
      }
      
      return true;
    } catch (err) {
      console.error('Error updating grievance status:', err);
      setError('Failed to update grievance status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Assign priority to a grievance
  const updateGrievancePriority = async (
    grievanceId: string, 
    priority: 'normal' | 'high' | 'urgent'
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const grievanceRef = ref(rtdb, `grievances/${grievanceId}`);
      
      await update(grievanceRef, {
        priority,
        lastUpdated: new Date().toISOString()
      });
      
      return true;
    } catch (err) {
      console.error('Error updating grievance priority:', err);
      setError('Failed to update grievance priority');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Assign grievance to an admin
  const assignGrievance = async (grievanceId: string, adminId: string, adminName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const grievanceRef = ref(rtdb, `grievances/${grievanceId}`);
      
      await update(grievanceRef, {
        assignedTo: adminId,
        assignedName: adminName,
        status: 'in-progress',
        lastUpdated: new Date().toISOString()
      });
      
      return true;
    } catch (err) {
      console.error('Error assigning grievance:', err);
      setError('Failed to assign grievance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get all users
  const getAllUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersRef = ref(rtdb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        return Object.keys(usersData).map(key => ({
          id: key,
          ...usersData[key]
        }));
      }
      
      return [];
    } catch (err) {
      console.error('Error getting users:', err);
      setError('Failed to fetch users');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update user status (block/unblock)
  const updateUserStatus = async (
    userId: string, 
    status: 'active' | 'warned' | 'blocked',
    reason?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const userRef = ref(rtdb, `users/${userId}`);
      
      const updateData: any = { status };
      
      if (status === 'blocked') {
        updateData.blockReason = reason || 'Blocked by admin';
        updateData.blockDate = new Date().toISOString();
      } else if (status === 'warned') {
        // Get current warnings
        const userSnapshot = await get(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          updateData.warnings = (userData.warnings || 0) + 1;
          updateData.warningReason = reason || 'Warned by admin';
          updateData.lastWarningDate = new Date().toISOString();
        }
      } else if (status === 'active') {
        updateData.unblockDate = new Date().toISOString();
      }
      
      await update(userRef, updateData);
      
      // Create notification for the user
      const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
      let notificationMessage = '';
      
      if (status === 'blocked') {
        notificationMessage = `Your account has been blocked. Reason: ${reason || 'Violation of platform policies'}`;
      } else if (status === 'warned') {
        notificationMessage = `You have received a warning. Reason: ${reason || 'Violation of platform policies'}`;
      } else if (status === 'active') {
        notificationMessage = 'Your account has been unblocked.';
      }
      
      await set(notificationRef, {
        type: `user_${status}`,
        message: notificationMessage,
        date: new Date().toISOString(),
        read: false
      });
      
      return true;
    } catch (err) {
      console.error(`Error updating user status to ${status}:`, err);
      setError(`Failed to update user status to ${status}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle credit requests
  const handleCreditRequest = async (
    requestId: string, 
    approved: boolean,
    creditsToGrant: number = 1
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      const requestRef = ref(rtdb, `creditRequests/${requestId}`);
      const requestSnapshot = await get(requestRef);
      
      if (!requestSnapshot.exists()) {
        throw new Error('Credit request not found');
      }
      
      const requestData = requestSnapshot.val();
      const userId = requestData.userId;
      
      if (approved) {
        // Update request status
        await update(requestRef, {
          status: 'approved',
          creditsGranted: creditsToGrant,
          approvedAt: new Date().toISOString()
        });
        
        // Update user credits
        const userRef = ref(rtdb, `users/${userId}`);
        const userSnapshot = await get(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.val();
          const currentCredits = userData.grievanceCredits || 0;
          
          await update(userRef, {
            grievanceCredits: currentCredits + creditsToGrant,
            lastCreditUpdate: new Date().toISOString()
          });
        }
        
        // Create notification for user
        const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
        await set(notificationRef, {
          type: 'credits_approved',
          message: `Your request for additional credits has been approved. You have been granted ${creditsToGrant} credit(s).`,
          date: new Date().toISOString(),
          read: false
        });
      } else {
        // Update request status to rejected
        await update(requestRef, {
          status: 'rejected',
          rejectedAt: new Date().toISOString()
        });
        
        // Create notification for user
        const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
        await set(notificationRef, {
          type: 'credits_rejected',
          message: 'Your request for additional credits has been rejected.',
          date: new Date().toISOString(),
          read: false
        });
      }
      
      return true;
    } catch (err) {
      console.error(`Error ${approved ? 'approving' : 'rejecting'} credit request:`, err);
      setError(`Failed to ${approved ? 'approve' : 'reject'} credit request`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete grievance (for inappropriate content)
  const deleteGrievance = async (grievanceId: string, notifyUser: boolean = true, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const grievanceRef = ref(rtdb, `grievances/${grievanceId}`);
      const grievanceSnapshot = await get(grievanceRef);
      
      if (!grievanceSnapshot.exists()) {
        throw new Error('Grievance not found');
      }
      
      const grievanceData = grievanceSnapshot.val();
      const userId = grievanceData.submittedBy;
      
      // Delete the grievance
      await remove(grievanceRef);
      
      if (notifyUser && userId) {
        // Create notification for the user
        const notificationRef = ref(rtdb, `notifications/${userId}/${Date.now()}`);
        await set(notificationRef, {
          type: 'grievance_deleted',
          message: `Your grievance (ID: ${grievanceId}) has been removed. Reason: ${reason || 'Violation of platform policies'}`,
          date: new Date().toISOString(),
          read: false
        });
      }
      
      return true;
    } catch (err) {
      console.error('Error deleting grievance:', err);
      setError('Failed to delete grievance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createAdminUser,
    getAllGrievances,
    getGrievancesByStatus,
    updateGrievanceStatus,
    updateGrievancePriority,
    assignGrievance,
    getAllUsers,
    updateUserStatus,
    handleCreditRequest,
    deleteGrievance
  };
}