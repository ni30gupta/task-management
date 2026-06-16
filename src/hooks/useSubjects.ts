import { useEffect, useState } from 'react';
import { getSubjects } from '../api/subjects';
import type { Subject } from '../types';



export const  useSubjects = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(true);

    useEffect(() => {
        const fetchSubjects = async () => {
            setLoadingSubjects(true);
            try {
                const res = await getSubjects();
                setSubjects(res.data.data);
            } catch {
                // non-critical, subjects will just be empty
            } finally {
                setLoadingSubjects(false);
            }
        };
        fetchSubjects();
    }, []);

    return { subjects, loadingSubjects };
}

