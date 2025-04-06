
import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/config/firebase';

export function useFirestoreCollection(collectionName: string) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, collectionName));
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setData(documents);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error("Error fetching collection:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName]);

  const addDocument = async (data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { id: docRef.id, ...data };
    } catch (err) {
      console.error("Error adding document:", err);
      throw err;
    }
  };

  const updateDocument = async (id: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (err) {
      console.error("Error updating document:", err);
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    } catch (err) {
      console.error("Error deleting document:", err);
      throw err;
    }
  };

  return { 
    data, 
    loading, 
    error, 
    addDocument, 
    updateDocument, 
    deleteDocument 
  };
}

export function useFirestoreDocument(collectionName: string, docId: string) {
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!docId) {
        setDocument(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDocument({
            id: docSnap.id,
            ...docSnap.data()
          });
        } else {
          setDocument(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [collectionName, docId]);

  const updateDocument = async (data: any) => {
    if (!docId) return null;
    
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, data);
      setDocument(prev => prev ? { ...prev, ...data } : null);
      return { id: docId, ...data };
    } catch (err) {
      console.error("Error updating document:", err);
      throw err;
    }
  };

  return { document, loading, error, updateDocument };
}
