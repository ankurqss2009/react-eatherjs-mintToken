import React from 'react';
import { Button,Navbar,Nav,NavDropdown,Container } from 'react-bootstrap';
import {
    Link
} from "react-router-dom";
const Header = () => {
    return (<Navbar bg="dark" expand="lg">
    <Container>
        <Navbar.Brand href="#home">Upload Documents</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/service-provider" className="nav-link">Service Provider</Link>
                <Link to="/user" className="nav-link">User</Link>
            </Nav>
        </Navbar.Collapse>
    </Container>
    </Navbar>
    )
}
export  default  Header;