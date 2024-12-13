import axios from 'axios';
import Layout from '../layout/Layout';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography, styled } from '@mui/material';
import { useData } from '../context/DataProvider';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Wrapper = styled(Box)({
    height: '100vh',
    width: '100%',
    background: 'lightgray',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
});

const UploadButton = styled(Box)({
    color: 'gray',
    textAlign: 'center',
    border: '2px dashed grey',
    borderRadius: '50%',
    height: 150,
    width: 150,
    padding: '15px 30px',
    cursor: 'pointer',
    ':hover': {
        color: 'black',
        border: '3px dashed black',
    },
});

const Content = styled(Box)({
    '& > p': {
        padding: '10px 0',
        width: '100%',
    },
    '& > div': {
        padding: '10px 0 ',
        width: '100%',
    },
});

const UploadMedia = () => {
    const { render, setRender } = useData();
    const [keywords, setKeywords] = useState('');
    const [files, setFiles] = useState(null); // Ensure files is null initially
    const [visibility, setVisibility] = useState('private'); // Set default visibility
    const [loading, setLoading] = useState(false);
    const [uploaded, setUploaded] = useState(0);
    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        setOpen(false); // Close dialog on upload attempt
        try {
            const formData = new FormData();
            formData.append('file', files); // Attach the file to FormData
            formData.append('keywords', keywords); // Attach keywords
            formData.append('visible', visibility); // Attach visibility

            setLoading(true);
            const response = await axios.post('/api/v1/media/upload', formData, {
                onUploadProgress: (data) => {
                    setUploaded(Math.round((data.loaded * 100) / data.total)); // Calculate upload percentage
                },
            });

            setLoading(false);
            if (response.status === 201) {
                toast.success(response.data.message);
                // Redirect based on file type
                if (files.type.includes('image')) {
                    navigate('/your-images');
                } else if (files.type.includes('video')) {
                    navigate('/your-videos');
                } else {
                    navigate('/your-docs');
                }
                setRender(!render);
                resetForm(); // Reset form inputs
            } else {
                toast.error(response.data.message);
                resetForm(); // Reset form inputs
            }
        } catch (error) {
            console.error(error);
            setLoading(false);
            resetForm(); // Reset form inputs
            toast.error('Something went wrong.');
        }
    };

    const resetForm = () => {
        setFiles(null); // Reset files
        setKeywords(''); // Reset keywords
        setVisibility('private'); // Reset visibility to default
        setUploaded(0); // Reset uploaded percentage
    };

    useEffect(() => {
        if (files) {
            setOpen(true); // Open dialog when a file is selected
        }
    }, [files]);

    return (
        <Layout title='Upload Page - MyCloud'>
            <Wrapper>
                <label htmlFor="file">
                    <UploadButton>
                        {uploaded ? (
                            <>
                                {uploaded > 0 && <Typography style={{ fontSize: 28, margin: '25px 0 0 0px' }}>{uploaded}%</Typography>}
                                {loading && <Typography>Uploading...</Typography>}
                            </>
                        ) : (
                            <>
                                <Upload style={{ fontSize: 75 }} />
                                <Typography>Select File</Typography>
                            </>
                        )}
                    </UploadButton>
                    <input
                        type="file"
                        onChange={(e) => setFiles(e.target.files[0])} // Set selected file
                        id="file"
                        style={{ display: 'none' }}
                    />
                </label>
                <Dialog
                    open={open}
                    hideBackdrop={true}
                    sx={{
                        "& .MuiDialog-container": {
                            "& .MuiPaper-root": {
                                width: "100%",
                                maxWidth: "40vw",
                                height: '100%',
                                maxHeight: '50vh',
                            },
                        },
                    }}
                >
                    <form onSubmit={handleUpload}>
                        <DialogTitle>Upload</DialogTitle>
                        <DialogContent>
                            <Content>
                                {files && <Typography>File Name - {files?.name}</Typography>}
                                {files && <Typography>File Size - {Math.round(files?.size / 1048576) + ' MB'}</Typography>}
                                <TextField
                                    onChange={(e) => setKeywords(e.target.value)}
                                    required
                                    label="Enter Keywords"
                                    variant='standard'
                                />
                                <TextField
                                    onChange={(e) => setVisibility(e.target.value)}
                                    value={visibility}
                                    required
                                    label='Visibility'
                                    variant='standard'
                                    select
                                >
                                    <MenuItem value="private">Private</MenuItem>
                                    <MenuItem value='public'>Public</MenuItem>
                                </TextField>
                            </Content>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type='submit' disabled={loading}>Upload</Button> {/* Disable button while loading */}
                        </DialogActions>
                    </form>
                </Dialog>
            </Wrapper>
        </Layout>
    );
};

export default UploadMedia;
