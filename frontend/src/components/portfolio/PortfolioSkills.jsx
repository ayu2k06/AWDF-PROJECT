// Portfolio Skills Component — Week 1 reusable component
const SKILL_CATEGORIES = [
  {
    category: 'Frontend',
    color: '#a78bfa',
    skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite'],
  },
  {
    category: 'Backend',
    color: '#22d3ee',
    skills: ['Node.js', 'Express', 'REST APIs', 'JWT Auth'],
  },
  {
    category: 'DevOps & Tools',
    color: '#fbbf24',
    skills: ['Git', 'GitHub', 'Docker', 'GitHub Actions', 'Postman'],
  },
  {
    category: 'Languages',
    color: '#fb7185',
    skills: ['JavaScript', 'Python', 'Java', 'C++'],
  },
];

const PortfolioSkills = ({ skills }) => {
  const categories = skills || SKILL_CATEGORIES;

  return (
    <section id="skills" style={{ padding: '3rem 0' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e2e2f0', marginBottom: '2rem' }}>
        Technical Skills
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {categories.map((cat) => (
          <div key={cat.category} className="glass-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: cat.color, marginBottom: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {cat.category}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {cat.skills.map((skill) => (
                <span key={skill} style={{
                  background: `${cat.color}15`,
                  border: `1px solid ${cat.color}30`,
                  color: '#e2e2f0',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  cursor: 'default',
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PortfolioSkills;
