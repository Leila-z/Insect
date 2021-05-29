const ghpages = require('gh-pages');

ghpages.publish(
    '__sapper__/export/leila',
    {
        branch: 'gh-pages',
        repo: 'https://github.com/Leila-z/insect.git',
        user: {
            name: 'Leila-z',
            email: 'zomorodi.leila@gmail.com'
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)
