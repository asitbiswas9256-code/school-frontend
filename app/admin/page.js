    const handleGenerate = async () => {
        if (!newId) return setMessage('Please enter an ID.');
        setMessage('Generating...');
        
        try {
            const token = localStorage.getItem('token'); 
            
            // THE FIX: Automatically choose the correct backend door based on the rank
            const endpoint = role === 'Assistant Headmaster' 
                ? 'https://school-backend-szf6.onrender.com/api/admin/add-assistant'
                : 'https://school-backend-szf6.onrender.com/api/admin/add-user';
            
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ userId: newId, password: 'password123', role: role })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(`Success! Created ${role}: ${newId}.`);
                setNewId('');
            } else {
                setMessage(`Backend Error: ${data.message || 'Failed'}`);
            }
        } catch (err) {
            setMessage('Network Error: Connecting to backend...');
        }
    };
