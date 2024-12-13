import { Box, Dialog, Typography, styled } from "@mui/material";
import { AddAPhoto } from '@mui/icons-material';
import { useData } from "../context/DataProvider";
import { useState } from "react";
import toast from 'react-hot-toast';
import axios from "axios";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';

const SignInWrapper = styled(Box)({
    width: '100%',
    height: '100%',
    display: 'flex'
});

const SignUpWrapper = styled(Box)({
    width: '100%',
    height: '100%',
    display: 'flex',
    background: '#f2f2f2'
});

const Image = styled('img')({
    height: 200,
    width: 200,
    marginTop: 50,
    borderRadius: '50%'
});

const RightBox = styled(Box)({
    width: '50vw',
    height: 'auto',
    overflowY: 'auto',
});

const LeftBox = styled(Box)({
    width: '50vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRight: '1px solid lightgrey'
});

const Text = styled(Typography)({
    padding: '5px 20px',
    fontSize: 14,
    color: '#0d6efd',
    '& > svg': {
        margin: '0 0 0 5px'
    },
    ':hover': {
        color: 'grey'
    },
    cursor: 'pointer'
});

const Error = styled(Typography)({
    fontSize: 10,
    color: 'red',
    fontWeight: 600,
    margin: '2px 0 0 0'
});

const LoginLeftBox = styled(Box)({
    width: '50vw',
    height: '100vh',
    backgroundImage: 'url(/images/login-image.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    color: '#ffffff',
    textAlign: 'center'
});

const LoginRightBox = styled(Box)({
    width: '50vw',
    height: 'auto',
    overflowY: 'auto',
    background: '#f2f2f2',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    '& > div': {
        background: '#ffffff',
        width: '80%',
        margin: '100px 0 0 0',
        borderRadius: 25,
        boxShadow: '1px 1px grey',
        textAlign: 'center',
        '& > p': {
            margin: '20px 0 0 0'
        },
    },
});

const ScrollableBox = styled(Box)({
    height: 'calc(100vh - 64px)', // This ensures it fills most of the viewport height
    overflowY: 'auto', // Enable scrolling
    padding: '20px'
});

const Login = () => {

    const [toggleForm, setToggleForm] = useState('sign-in');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profile, setProfile] = useState('');
    const [loading, setLoading] = useState(false);

    const { setAuth, openLoginDialog, setOpenLoginDialog } = useData();

    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            if (profile) {
                if (!profile?.type.includes('image')) {
                    return toast.error('Profile should be an image.')
                }
                if (profile?.size > 1000000) {
                    return toast.error('Profile image size must be 1MB.')
                }
            }
            if (password !== confirmPassword) {
                return toast.error('Password and confirm password is not matching.')
            }
            if (password?.length < 6) {
                return toast.error('Password Must Be 6 Characters Long.')
            }
            const formData = new FormData()
            formData.append('firstName', firstName)
            formData.append('lastName', lastName)
            formData.append('email', email)
            formData.append('password', password)
            profile && formData.append('profile', profile)
            setLoading(true)
            const response = await axios.post('/api/v1/auth/register', formData)
            response && setLoading(false)
            response && toast.success(response.data.message)
            if (response.status === 201) {
                setToggleForm('sign-in')
            }
        } catch (error) {
            console.log(error);
            toast.error('Something Went Wrong')
            setLoading(false)
        }
    };

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            setLoading(true)
            const response = await axios.post('/api/v1/auth/login', { email, password })
            response && setLoading(false)
            if (response.data.success) {
                setAuth(response.data)
                localStorage.setItem('auth', JSON.stringify(response.data))
                toast.success(response.data.message)
                setOpenLoginDialog(!openLoginDialog)
            } else {
                toast.error(response.data.message)
            }
        } catch (error) {
            console.log(error);
            toast.error('Something Went Wrong')
            setLoading(false)
        }
    };

    return (
        <Dialog open={openLoginDialog} onClose={() => setOpenLoginDialog(!openLoginDialog)} hideBackdrop={true} sx={{
            "& .MuiDialog-container": {
                "& .MuiPaper-root": {
                    width: "100%",
                    maxWidth: "70vw",
                    height: 'auto', // Allow the dialog to grow with content
                    maxHeight: '80vh', // Limit the height to make it scrollable
                },
            },
        }} >
            {toggleForm === 'sign-in' ? (
                <SignInWrapper>
                    <LoginLeftBox>
                        <Typography variant="h2" style={{ margin: '200px 0 20px 0' }}>Welcome Back</Typography>
                        <Typography variant="h5">We would be glad to serve you again.</Typography>
                    </LoginLeftBox>
                    <LoginRightBox>
                        <ScrollableBox>
                            <Box>
                                <Typography as="h3" className="text-primary" style={{ margin: 20, textAlign: 'center' }}>Sign In</Typography>
                                <Form onSubmit={handleSignIn} style={{ padding: '20px' }}>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Label>Email address</Form.Label>
                                        <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} required />
                                    </Form.Group>

                                    <Form.Group controlId="formBasicPassword" className="mt-3">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="w-100 mt-4" disabled={loading}>
                                        {loading ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </Form>
                                <Button variant="link" className="mt-3" onClick={() => setToggleForm('sign-up')}>
                                    Don't have an account? <span className="text-primary">Sign Up</span>
                                </Button>
                            </Box>
                        </ScrollableBox>
                    </LoginRightBox>
                </SignInWrapper>
            ) : (
                <SignUpWrapper>
                    <LeftBox>
                        <label htmlFor="profile">
                            <Image src={profile ? URL.createObjectURL(profile) : "/images/account.jpg"} alt="" />
                            <Text>Add Profile Picture <AddAPhoto fontSize="small" /></Text>
                            {profile?.size > 1000000 && <Error>Profile size should be less than 1 MB.</Error>}
                            {profile && !profile?.type.includes('image') && <Error>Only Image Flies .jpg, .jpeg, .png are accepted</Error>}
                        </label>
                    </LeftBox>
                    <RightBox>
                        <ScrollableBox>
                            <Typography as="h3" className="text-primary" style={{ margin: 20, textAlign: 'center' }}>Sign Up Form</Typography>
                            <Form onSubmit={handleSignUp} style={{ padding: '20px' }}>
                                <Form.Group controlId="formFirstName">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control type="text" placeholder="First name" onChange={(e) => setFirstName(e.target.value)} required />
                                </Form.Group>

                                <Form.Group controlId="formLastName" className="mt-3">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control type="text" placeholder="Last name" onChange={(e) => setLastName(e.target.value)} required />
                                </Form.Group>

                                <Form.Group controlId="formBasicEmail" className="mt-3">
                                    <Form.Label>Email address</Form.Label>
                                    <Form.Control type="email" placeholder="Enter email" onChange={(e) => setEmail(e.target.value)} required />
                                </Form.Group>

                                <Form.Group controlId="formBasicPassword" className="mt-3">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                                </Form.Group>

                                <Form.Group controlId="formConfirmPassword" className="mt-3">
                                    <Form.Label>Confirm Password</Form.Label>
                                    <Form.Control type="password" placeholder="Confirm password" onChange={(e) => setConfirmPassword(e.target.value)} required />
                                    {confirmPassword !== password && <Error>Password is not matching.</Error>}
                                </Form.Group>

                                <Button variant="primary" type="submit" className="w-100 mt-4" disabled={loading}>
                                    {loading ? 'Signing up...' : 'Sign Up'}
                                </Button>
                                <Button variant="link" className="mt-3" onClick={() => setToggleForm('sign-in')}>
                                    Already have an account? <span className="text-primary">Sign In</span>
                                </Button>
                            </Form>
                            {/* Add the "Sign In" button here */}
                        </ScrollableBox>
                    </RightBox>
                </SignUpWrapper>
            )}
        </Dialog>
    );
};

export default Login;
