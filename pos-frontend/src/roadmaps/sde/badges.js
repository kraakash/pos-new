const badges = [
  { id: 'b1', title: 'First Step', description: 'Completed Stage 1', icon: '👣', color: '#40e0d0', condition: { stageId: 'stage-1', type: 'stage_complete' } },
  { id: 'b2', title: 'Code Rookie', description: 'Completed Programming Fundamentals', icon: '🌱', color: '#a78bfa', condition: { stageId: 'stage-2', type: 'stage_complete' } },
  { id: 'b3', title: 'DSA Beginner', description: 'Completed first 5 DSA topics', icon: '🔰', color: '#f472b6', condition: { type: 'topics_count', stageId: 'stage-3', count: 5 } },
  { id: 'b4', title: 'Graph Master', description: 'Completed Graphs topic', icon: '🕸️', color: '#f472b6', condition: { topicId: 't3-13', type: 'topic_complete' } },
  { id: 'b5', title: 'DP Fighter', description: 'Completed Dynamic Programming', icon: '⚔️', color: '#f472b6', condition: { topicId: 't3-15', type: 'topic_complete' } },
  { id: 'b6', title: 'DSA Warrior', description: 'Completed all of Stage 3', icon: '🏹', color: '#f472b6', condition: { stageId: 'stage-3', type: 'stage_complete' } },
  { id: 'b7', title: 'CS Scholar', description: 'Completed Core CS Subjects', icon: '🎓', color: '#fb923c', condition: { stageId: 'stage-4', type: 'stage_complete' } },
  { id: 'b8', title: 'Builder', description: 'Completed Development Skills', icon: '🛠️', color: '#34d399', condition: { stageId: 'stage-5', type: 'stage_complete' } },
  { id: 'b9', title: 'Project Builder', description: 'Shipped 3 projects', icon: '🚀', color: '#60a5fa', condition: { type: 'topics_count', stageId: 'stage-6', count: 3 } },
  { id: 'b10', title: 'Communicator', description: 'Completed Aptitude & Communication', icon: '🗣️', color: '#fbbf24', condition: { stageId: 'stage-7', type: 'stage_complete' } },
  { id: 'b11', title: 'Interview Ready', description: 'Completed Interview Preparation', icon: '🎯', color: '#f87171', condition: { stageId: 'stage-8', type: 'stage_complete' } },
  { id: 'b12', title: 'Resume Pro', description: 'Completed Resume & LinkedIn', icon: '📄', color: '#c084fc', condition: { stageId: 'stage-9', type: 'stage_complete' } },
  { id: 'b13', title: 'Placement Warrior', description: 'Applied to 10+ companies', icon: '⚡', color: '#f97316', condition: { type: 'manual', stageId: 'stage-11' } },
  { id: 'b14', title: 'Industry Pro', description: 'Completed Industry-Level Skills', icon: '🏭', color: '#818cf8', condition: { stageId: 'stage-12', type: 'stage_complete' } },
];

export default badges;
