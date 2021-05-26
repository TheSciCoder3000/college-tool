const Header = ({vers}) => {
    return (
        <header className='container'>
            <h1>Task Tracker {vers}</h1>
        </header>
    )
}

Header.defaultProps = {
    vers: '0'
}

export default Header
