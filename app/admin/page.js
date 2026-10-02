    return (
        <div style={{ minHeight: '100vh', padding: '2rem 1rem', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ color: '#000080', margin: '0', fontSize: '20px' }}>Admin Command</h2>
                    <button onClick={handleLogout} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Log Out</button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', flexWrap: 'wrap' }}>
                    <button onClick={() => { setActiveTab('generate'); setMessage(''); }} style={{ flex: '1 1 30%', padding: '0.75rem 0.25rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'generate' ? '#000080' : '#f1f5f9', color: activeTab === 'generate' ? 'white' : '#475569', fontSize: '13px' }}>Gen IDs</button>
                    <button onClick={() => { setActiveTab('leaves'); setMessage(''); }} style={{ flex: '1 1 30%', padding: '0.75rem 0.25rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'leaves' ? '#0f766e' : '#f1f5f9', color: activeTab === 'leaves' ? 'white' : '#475569', fontSize: '13px' }}>Leave Inbox</button>
                    <button onClick={() => { setActiveTab('reports'); setMessage(''); }} style={{ flex: '1 1 30%', padding: '0.75rem 0.25rem', fontWeight: 'bold', borderRadius: '6px', cursor: 'pointer', border: 'none', backgroundColor: activeTab === 'reports' ? '#b91c1c' : '#f1f5f9', color: activeTab === 'reports' ? 'white' : '#475569', fontSize: '13px' }}>Under Zone</button>
                </div>

                {message && <div style={{ padding: '0.75rem', marginBottom: '1.5rem', backgroundColor: message.includes('Success') || message.includes('marked') || message.includes('Approved') || message.includes('Rejected') ? '#dcfce7' : '#fee2e2', color: message.includes('Error') ? '#b91c1c' : '#166534', borderRadius: '6px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>{message}</div>}

                {activeTab === 'generate' && (
                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>Select Rank:</label>
                            <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }}>
                                <option value="Assistant Headmaster">Assistant Headmaster</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Student">Student</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '14px' }}>New User ID:</label>
                            <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="e.g. teacher99" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box', fontSize: '16px' }} />
                        </div>
                        <button onClick={handleGenerate} style={{ width: '100%', padding: '0.85rem', backgroundColor: '#000080', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Generate ID</button>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div>
                        {loadingReports ? <p style={{ textAlign: 'center', color: '#64748b' }}>Decrypting reports...</p> : reports.length === 0 ? <p style={{ textAlign: 'center', color: '#64748b' }}>Inbox empty.</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {reports.map((report) => {
                                    const badge = getBadgeStyle(report.status);
                                    return (
                                        <div key={report._id} style={{ backgroundColor: '#fff1f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fecdd3', borderLeft: `4px solid ${badge.bg === '#dcfce7' ? '#166534' : '#b91c1c'}` }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ margin: 0, color: '#9f1239', fontSize: '16px' }}>{report.title}</h3>
                                                <span style={{ backgroundColor: badge.bg, color: badge.text, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>{report.status}</span>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 0.5rem 0' }}><strong>From:</strong> {report.reporterId} ({report.reporterRole}) | {new Date(report.createdAt).toLocaleDateString()}</p>
                                            <div style={{ backgroundColor: 'white', padding: '0.75rem', borderRadius: '6px', fontSize: '14px', border: '1px solid #fecdd3', marginBottom: '0.75rem' }}>{report.description}</div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {report.status === 'Pending' && <button onClick={() => updateReportStatus(report._id, 'Reviewed')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Mark Reviewed</button>}
                                                {report.status !== 'Resolved' && <button onClick={() => updateReportStatus(report._id, 'Resolved')} style={{ padding: '0.4rem 0.8rem', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>Mark Resolved</button>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
