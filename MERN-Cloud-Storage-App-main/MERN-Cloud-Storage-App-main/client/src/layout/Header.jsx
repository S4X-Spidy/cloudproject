import { AppBar, Box, InputBase, Toolbar, Typography, styled } from '@mui/material'
import { AccountCircleOutlined, Cloud, CloudUpload, Menu, Mic, Search } from '@mui/icons-material'
import { useData } from '../context/DataProvider'
import { useNavigate } from 'react-router-dom'
import Button from 'react-bootstrap/Button'  // Import Bootstrap Button
import 'bootstrap/dist/css/bootstrap.min.css';

const Heading = styled(Box)(({ theme }) => ({
    display: 'flex',
    margin: '0px 20px',
    cursor: 'pointer',
    color: theme.palette.primary.contrastText,  // Standard text color
    '& > svg': {
        margin: '3px 5px 5px 5px',
        color: theme.palette.secondary.paper  // Standard icon color
    },
    '& > p': {
        margin: '5px 5px 0px 5px',
        fontSize: 24,
        fontWeight: 600
    }
}))

const SearchWrapper = styled('form')(({ theme }) => ({
    border: `1px solid ${theme.palette.grey[500]}`,
    margin: '0 0 0 160px',
    borderRadius: 25,
    minWidth: 590,
    maxWidth: 620,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 10px',
    backgroundColor: theme.palette.background.paper, // Add background color
    '& > div': {
        width: '100%',
        padding: '0 10px'
    }
}))

const RightSection = styled(Box)(({ theme }) => ({
    marginLeft: 'auto',
    '& > svg': {
        cursor: 'pointer',
        color: theme.palette.secondary.paper  // Standard icon color
    }
}))

const Header = () => {

    const navigate = useNavigate()

    const {
        setRender, render,
        searchValue, setSearchValue,
        openSideBar, setOpenSideBar,
        auth, openLoginDialog, setOpenLoginDialog,
        openAccountInfoDialog, setOpenAccountInfoDialog,
        setOpenSearchDialog, openSearchDialog,
        setListening, listening
    } = useData()

    const handleSearch = (e) => {
        e.preventDefault()
        navigate('/search')
        setRender(!render)
    }

    const onMicClick = () => {
        setOpenSearchDialog(!openSearchDialog)
        setListening(!listening)
    }

    return (
        <AppBar sx={{ height: '64px', backgroundColor: '#1976d2' }} position='static'> {/* Updated Nav Bar color */}
            <Toolbar>
                <Menu onClick={() => setOpenSideBar(!openSideBar)} sx={{ cursor: 'pointer', color: '#fff' }} />
                <Heading onClick={() => navigate('/')}>
                    <Cloud fontSize='large' />
                    <Typography>FileSphere</Typography> 
                </Heading>
                <SearchWrapper onSubmit={(e) => handleSearch(e)}>
                    <InputBase value={searchValue} onChange={(e) => setSearchValue(e.target.value)} required placeholder='Search' />
                    <button type='submit' style={{
                        border: 'none',
                        color: 'inherit',
                        background: 'inherit'
                    }} ><Search style={{ cursor: 'pointer', color: '#fff' }} /></button> {/* Updated icon color */}
                </SearchWrapper>
                <Mic onClick={() => onMicClick()} style={{ marginLeft: 10, cursor: 'pointer', color: '#fff' }} /> {/* Updated icon color */}
                <RightSection>
                    {
                        auth ? (
                            <>
                                <CloudUpload sx={{ marginRight: 5, marginBottom: '5px', color: '#fff' }} onClick={() => navigate('/upload')} />
                                {
                                    auth?.user?.profile ?
                                        <img onClick={() => setOpenAccountInfoDialog(!openAccountInfoDialog)}
                                            style={{
                                                marginTop: 5,
                                                height: 40,
                                                width: 40,
                                                borderRadius: '50%',
                                                cursor: 'pointer'
                                            }} src={`/api/v1/auth/user-profile/${auth?.user?.profile}`} alt="profile" />
                                        :
                                        <img onClick={() => setOpenAccountInfoDialog(!openAccountInfoDialog)}
                                            style={{
                                                marginTop: 5,
                                                height: 40,
                                                width: 40,
                                                borderRadius: '50%',
                                                cursor: 'pointer'
                                            }} src="/images/account.jpg" alt="profile" />
                                }
                            </>
                        ) :
                            (
                                <Button onClick={() => setOpenLoginDialog(!openLoginDialog)} variant="outline-light" style={{ marginRight: '10px'}}> {/* Bootstrap Button */}
                                    <AccountCircleOutlined style={{ marginRight: 5}} />
                                    Sign In
                                </Button>
                            )
                    }
                </RightSection>
            </Toolbar>
        </AppBar>
    )
}

export default Header
