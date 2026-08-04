import sys

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""          const syncedUser: UserAccount = {
            id: sbUser.id,
            email: sbUser.email || '',
            name: metadata.name || '김투수',
            number: typeof metadata.number === 'number' ? metadata.number : 18,
            team: metadata.team || '서울 자이언츠',
            throwingArm: metadata.throwingArm || 'RHP',
            joinedDate: sbUser.created_at ? sbUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            maxVelocity: metadata.maxVelocity || 153.2,
            height: metadata.height || 185,
            weight: metadata.weight || 85,
            wingspan: metadata.wingspan || 190,
            age: metadata.age || 24,
            birthdate: metadata.birthdate || '2000-01-15',
            avatarUrl: metadata.avatarUrl || '',
          };""",
"""          const syncedUser: UserAccount = {
            id: sbUser.id,
            email: sbUser.email || '',
            name: metadata.name || '김투수',
            number: typeof metadata.number === 'number' ? metadata.number : 18,
            team: metadata.team || '서울 자이언츠',
            throwingArm: metadata.throwingArm || 'RHP',
            joinedDate: sbUser.created_at ? sbUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
            maxVelocity: metadata.maxVelocity || 153.2,
            height: metadata.height || 185,
            weight: metadata.weight || 85,
            wingspan: metadata.wingspan || 190,
            age: metadata.age || 24,
            birthdate: metadata.birthdate || '2000-01-15',
            avatarUrl: metadata.avatarUrl || '',
            isAdmin: sbUser.email === 'cheatpt@gmail.com',
          };"""
)

content = content.replace(
"""        const syncedUser: UserAccount = {
          id: sbUser.id,
          email: sbUser.email || '',
          name: metadata.name || '김투수',
          number: typeof metadata.number === 'number' ? metadata.number : 18,
          team: metadata.team || '서울 자이언츠',
          throwingArm: metadata.throwingArm || 'RHP',
          joinedDate: sbUser.created_at ? sbUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          maxVelocity: metadata.maxVelocity || 153.2,
          height: metadata.height || 185,
          weight: metadata.weight || 85,
          wingspan: metadata.wingspan || 190,
          age: metadata.age || 24,
          birthdate: metadata.birthdate || '2000-01-15',
          avatarUrl: metadata.avatarUrl || '',
        };""",
"""        const syncedUser: UserAccount = {
          id: sbUser.id,
          email: sbUser.email || '',
          name: metadata.name || '김투수',
          number: typeof metadata.number === 'number' ? metadata.number : 18,
          team: metadata.team || '서울 자이언츠',
          throwingArm: metadata.throwingArm || 'RHP',
          joinedDate: sbUser.created_at ? sbUser.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          maxVelocity: metadata.maxVelocity || 153.2,
          height: metadata.height || 185,
          weight: metadata.weight || 85,
          wingspan: metadata.wingspan || 190,
          age: metadata.age || 24,
          birthdate: metadata.birthdate || '2000-01-15',
          avatarUrl: metadata.avatarUrl || '',
          isAdmin: sbUser.email === 'cheatpt@gmail.com',
        };"""
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

