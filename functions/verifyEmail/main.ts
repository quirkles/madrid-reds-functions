import { http } from '@google-cloud/functions-framework'

http('main', (req, res) => {
    res.send('Hello World!');
});
