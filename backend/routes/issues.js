const express = require('express');
const router = express.Router();
const issueController = require('../controllers/issueController');
const { auth } = require('../middleware/auth');
const upload = require('../services/uploadService');

const handlePhotoUpload = (req, res, next) => {
  upload.single('photo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Photo file size exceeds 5MB limit' });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
};

router.post('/events/:id/issues', auth, handlePhotoUpload, issueController.createIssue);
router.get('/events/:id/issues', auth, issueController.getIssuesByEvent);
router.put('/issues/:id', auth, issueController.updateIssueStatus);

module.exports = router;
