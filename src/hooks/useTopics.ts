import { useEffect, useState } from "react";
import { getTopicsBySubject } from "../api/subjects";


const useTopics = ({ subject }: { subject: string|undefined }) => {

    const [topics, setTopics] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const res = await getTopicsBySubject(subject);
                setTopics(res.data.data);
            } catch {
                // non-critical, topics will just be empty
            } 
        }

        fetchTopics()

    })

    return { topics };
}
export default useTopics