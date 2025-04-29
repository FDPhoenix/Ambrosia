import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Slide,
} from '@mui/material';

const FormModal = ({ open, handleClose, onSubmit, formData }) => {
  return (
    <Dialog
  open={open}
  onClose={handleClose}
  TransitionComponent={Slide}
  transitionDuration={500}
  fullWidth
  maxWidth="sm"
  sx={{
    '& .MuiDialog-paper': {
      padding: '32px',
      borderRadius: '20px',
      backgroundColor: '#fefefe',
      boxShadow: '0px 15px 50px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease-in-out',
    },
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      transition: 'opacity 0.3s ease-in-out',
    },
  }}
>
  <DialogTitle sx={{
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1.3rem',
    color: '#4A4A4A',
    paddingBottom: '20px',
  }}>
    {formData.title}
  </DialogTitle>

  <form onSubmit={onSubmit}>
    <DialogContent sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      marginTop: '16px',
    }}>
      {formData.fields.map((field, index) => (
        <TextField
          value={field.value}
          key={index}
          label={field.label}
          type={field.type || 'text'}
          name={field.name}
          fullWidth
          margin="normal"
          required={field.required || false}
          onChange={field.onChange}
          disabled={field.disable || false}
          multiline={field.multiline || false}
          variant="filled"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && field.multiline) {
              e.stopPropagation();
            }
          }}
          sx={{
            '& .MuiInputLabel-root': {
              color: '#888', 
            },
            '& .MuiFilledInput-root': {
              backgroundColor: '#fafafa', 
              '&:hover': {
                backgroundColor: '#f1f1f1', 
              },
              '&.Mui-focused': {
                backgroundColor: '#e9e9e9', 
              },
            },
            '& .MuiFilledInput-underline': {
              borderBottom: '2px solid #ccc', 
            },
          }}
        />
      ))}
    </DialogContent>

    <DialogActions sx={{
      justifyContent: 'space-between',
      paddingTop: '24px',
    }}>
      <Button
        onClick={handleClose}
        variant="outlined"
        sx={{
          color: '#BDBDBD',
          borderColor: '#BDBDBD',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="contained"
        sx={{
          backgroundColor: '#5C6BC0',
          color: 'white',
          '&:hover': {
            backgroundColor: '#3F51B5',
          },
        }}
      >
        {formData.submitText}
      </Button>
    </DialogActions>
  </form>
</Dialog>

  );
};

export default FormModal;
