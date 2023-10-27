import React from 'react';
import {Form, Col, Button, Modal, Row} from 'react-bootstrap';
import axios from 'axios';
import { Trans } from 'react-i18next';
import i18n from '../util/i18n';
import { CheckCircle, ExclamationTriangle, HourglassSplit, XCircle, InfoCircle } from 'react-bootstrap-icons';
import '../css/createCampaign.css';
import '../css/modal.css';
import ReactGA from "react-ga4";
ReactGA.initialize("G-C657WZY5VT");

class Registration extends React.Component {
    
    constructor(props){
        super(props);
        this.state = {
          showModal: false,
          modalTitle: '',
          modalTitleError: '',
          showModalRegistr: false,
          showModalConnect: false,
          showModalDisconnect: false,
          showModalCode: false,
          email: '',
          password: '',
          repeetpass: '',
          confcode: '',
          key: ''
        };
    };

    async startAuthorization(event){
      try{
        if(!this.state.email) {
          this.setState(
              {showModal:true, modalTitleError: 'requiredFieldsTitle',
                  modalMessage: 'emailRequired', modalIcon: 'ExclamationTriangle',
                  waitToClose: false,
                  modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
              });
          return false;
        }
        if(!this.state.password) {
          this.setState(
              {showModal:true, modalTitleError: 'requiredFieldsTitle',
                  modalMessage: 'passwordRequired', modalIcon: 'ExclamationTriangle',
                  waitToClose: false,
                  modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
              });
          return false;
        } 
        let userData = {};
        userData.to_email = this.state.email;
        let res = await axios.post('/api/auth/autor_start', {mydata : userData},
                           {headers: {"Content-Type": "application/json"}}); 
        if (res.data == 'no_user'){
         this.setState(
           {showModal:true, modalTitleError: 'failed',
               modalMessage: 'noUser', modalIcon: 'ExclamationTriangle',
               waitToClose: false,
               modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
         });
         return (false);  
        }    
        if (res.data == 'bad_password'){
          this.setState(
            {showModal:true, modalTitleError: 'failed',
                modalMessage: 'badPassword', modalIcon: 'ExclamationTriangle',
                waitToClose: false,
                modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
          });
          return (false);  
         }                     
        this.setState({showModal: true, modalTitleError: "attention", modalMessage: 'sendcode',
           modalIcon: 'InfoCircle', 
           modalButtonMessage: 'ok',
           modalButtonVariant: "#E63C36", waitToClose: false
        });                   
      }catch(error)  {
        this.setState({showModal: true, goHome: true,
          modalTitleError: 'failed',
          modalMessage: 'errorAuthorization',
          modalIcon: 'CheckCircle',
          modalButtonMessage: 'ok',
          modalButtonVariant: "#E63C36", waitToClose: false
        });
      }
    }

    async startRegistration(event){
      try{
        if(!this.state.email) {
          this.setState(
              {showModal:true, modalTitleError: 'requiredFieldsTitle',
                  modalMessage: 'emailRequired', modalIcon: 'ExclamationTriangle',
                  waitToClose: false,
                  modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
              });
          return false;
        }
        if(!this.state.password) {
          this.setState(
              {showModal:true, modalTitleError: 'requiredFieldsTitle',
                  modalMessage: 'passwordRequired', modalIcon: 'ExclamationTriangle',
                  waitToClose: false,
                  modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
              });
          return false;
        }
        if(!this.state.repeetpass) {
          this.setState(
              {showModal:true, modalTitleError: 'requiredFieldsTitle',
                  modalMessage: 'repeetpassRequired', modalIcon: 'ExclamationTriangle',
                  waitToClose: false,
                  modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
              });
          return false;
        }
        if(this.state.password != this.state.repeetpass) {
          this.setState(
            {showModal:true, modalTitleError: 'requiredFieldsTitle',
                modalMessage: 'passwordsNoMatch', modalIcon: 'ExclamationTriangle',
                waitToClose: false,
                modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
            });
          return false;
        }
        let userData = {};
        userData.to_email = this.state.email;
        userData.password = this.state.password;
        let res = await axios.post('/api/auth/registr_start', {mydata : userData},
                           {headers: {"Content-Type": "application/json"}}); 
        if (res.data == 'bad_user'){
          this.setState(
            {showModal:true, modalTitleError: 'failed',
                modalMessage: 'oldemail', modalIcon: 'ExclamationTriangle',
                waitToClose: false,
                modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
            });
          return (false);  
        }                   
        this.setState({showModal: true, modalTitleError: "attention", modalMessage: 'sendcode',
          modalIcon: 'InfoCircle', 
          modalButtonMessage: 'ok',
          modalButtonVariant: "#E63C36", waitToClose: false
        });
      } catch(error)  {
        this.setState({showModal: true, goHome: true,
          modalTitleError: 'failed',
          modalMessage: 'errorRegistration',
          modalIcon: 'CheckCircle',
          modalButtonMessage: 'ok',
          modalButtonVariant: "#E63C36", waitToClose: false
        });
      }
    }

    async resendCode(){
      try{
        let userData = {};
        userData.to_email = this.state.email;
        let res = await axios.post('/api/auth/registr_start', {mydata : userData},
                 {headers: {"Content-Type": "application/json"}}); 
        this.setState({showModal: true, modalTitleError: "attention", modalMessage: 'sendcode',
          modalIcon: 'InfoCircle', 
          modalButtonMessage: 'ok',
          modalButtonVariant: "#E63C36", waitToClose: false
        });
      } catch(error)  {
        this.setState({showModal: true, goHome: true,
          modalTitleError: 'failed',
          modalMessage: 'errorRegistration',
          modalIcon: 'CheckCircle',
          modalButtonMessage: 'ok',
          modalButtonVariant: "#E63C36", waitToClose: false
        });
      }
    }

    async endAuthorization(event){
      try{
        let userData = {};
        userData.to_email = this.state.email;
        userData.code = this.state.confcode;
        userData.password = this.state.password;
        let res = await axios.post('/api/auth/check_code', {mydata : userData},
                          {headers: {"Content-Type": "application/json"}}); 
        if (res.data == false){
          this.setState(
            {showModal:true, modalTitleError: 'requiredFieldsTitle',
                modalMessage: 'badcode', modalIcon: 'ExclamationTriangle',
                waitToClose: false, 
                modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
            });
        return false;
        }
        else{
          res = await axios.post('/api/auth/autor_end', {mydata : userData},
                          {headers: {"Content-Type": "application/json"}});
            if ((res.data.success)&&(res.data.success == true)) {
            this.setState({showModal: true, goHome: true,
              modalTitleError: 'success',
              modalMessage: 'authorizationComplete',
              modalIcon: 'CheckCircle',
              showModalCode: false,
              modalButtonMessage: 'returnHome',
              modalButtonVariant: "#E63C36", waitToClose: false
            }); 
            window.connect = true;
            console.log(document.cookie);
          }else{
            this.setState({showModal: true, goHome: true,
              modalTitleError: 'failed',
              modalMessage: 'errorAuthorization',
              modalIcon: 'CheckCircle',
              modalButtonMessage: 'returnHome',
              modalButtonVariant: "#E63C36", waitToClose: false
            });
          }                
        }   
      } catch(error)  {
        this.setState({showModal: true, goHome: true,
          modalTitleError: 'failed',
          modalMessage: 'errorAuthorization',
          modalIcon: 'CheckCircle',
          modalButtonMessage: 'returnHome',
          modalButtonVariant: "#E63C36", waitToClose: false
        });
      }
    } 

    async endRegistration(event){
      try{
        let userData = {};
        userData.to_email = this.state.email;
        userData.code = this.state.confcode;
        userData.password = this.state.password;
        let res = await axios.post('/api/auth/check_code', {mydata : userData},
                          {headers: {"Content-Type": "application/json"}});  
        if (res.data == false){
          this.setState(
            {showModal:true, modalTitleError: 'requiredFieldsTitle',
                modalMessage: 'badcode', modalIcon: 'ExclamationTriangle',
                waitToClose: false, 
                modalButtonMessage: 'closeBtn', modalButtonVariant: '#E63C36'
            });
        return false;
        }
        else{
          res = await axios.post('/api/auth/registr_end', {mydata : userData},
                          {headers: {"Content-Type": "application/json"}});
          if (res.data == 'success') {
            this.setState({showModal: true, goHome: true,
              modalTitleError: 'successd',
              modalMessage: 'registrationComplete',
              modalIcon: 'CheckCircle',
              showModalCode: false,
              modalButtonMessage: 'returnHome',
              modalButtonVariant: "#E63C36", waitToClose: false
            }); 
          }else{
            this.setState({showModal: true, goHome: true,
              modalTitleError: 'failed',
              modalMessage: 'errorRegistration',
              modalIcon: 'CheckCircle',
              modalButtonMessage: 'returnHome',
              modalButtonVariant: "#E63C36", waitToClose: false
            });
          }                
        }   
      } catch(error)  {
        this.setState({showModal: true, goHome: true,
          modalTitleError: 'failed',
          modalMessage: 'errorRegistration',
          modalIcon: 'CheckCircle',
          modalButtonMessage: 'returnHome',
          modalButtonVariant: "#E63C36", waitToClose: false
        });
      }
    } 

    handleChange = (e) => {
      const name = e.target.name
      const value = e.target.value;
      const checked = e.target.checked;
      if (name === 'fiatPayments')
      this.setState({fiatPayments: checked});
      else
      this.setState({ [name] : value, updateMeta : true });
  }

    render(){
        return(
           <div>
            <Modal show={this.state.showModal} onHide={()=>{}} className='myModal' centered>
                    <Modal.Body><p className='errorIcon'>
                        {this.state.errorIcon == 'CheckCircle' && <CheckCircle style={{color:'#588157'}} />}
                        {this.state.errorIcon == 'ExclamationTriangle' && <ExclamationTriangle/>}
                        {this.state.errorIcon == 'HourglassSplit' && <HourglassSplit style={{color: 'gold'}}/>}
                        {this.state.errorIcon == 'XCircle' && <XCircle style={{color: '#E63C36'}}/>}
                        {this.state.errorIcon == 'InfoCircle' && <InfoCircle style={{color: '#588157'}}/>}
                        </p>
                        <p className='modalTitle'><Trans i18nKey={this.state.modalTitleError}/></p>
                        <p className='modalMessage'><Trans i18nKey={this.state.modalMessage}/></p>
                        {!this.state.waitToClose &&
                        <Button className='modalButtonError'
                            style={{backgroundColor : this.state.modalButtonVariant, borderColor : this.state.modalButtonVariant}}
                            onClick={ () => {this.setState({showModal:false, modalButtonVariant: '#588157'});
                               if(this.state.modalButtonMessage == 'returnHome') this.props.history.push('/');
                               else if(this.state.modalTitleError == 'attention') 
                                   this.setState({showModalCode: true, showModalRegistr: false, showModalConnect: false});
                            }}>
                            <Trans i18nKey={this.state.modalButtonMessage} />
                        </Button>
                        }
                    </Modal.Body>
             </Modal>
             <Modal show={this.state.showModalRegistr} onHide={()=>{}} className='myModal'>
             <Modal.Header>
                <Modal.Title className='modalTitle' style={{margin: {left: "30%"}}}>
                <Trans i18nKey={this.state.modalTitle}/>
                </Modal.Title>
             </Modal.Header>  
             <Modal.Body>
                <Form> 
                <Form.Group>
                <Row>
                 <p className='redAsterisk'><Trans i18nKey={'email'}/></p> 
                </Row>
                <Row>
                <Form.Control required type="email" className="createFormPlaceHolder"
                                          name='email' value={this.state.email} onChange={this.handleChange}/>
                </Row>
                <Row>
                 <p className='redAsterisk'><Trans i18nKey={'password'}/></p> 
                </Row>
                <Row>
                <Form.Control required type="password" className="createFormPlaceHolder"
                                          name='password' value={this.state.password} onChange={this.handleChange}/>
                </Row>
                <Row>
                 <p className='redAsterisk'><Trans i18nKey={'repeetpass'}/></p> 
                </Row>
                <Row>
                <Form.Control required type="password" className="createFormPlaceHolder"
                                          name='repeetpass' value={this.state.repeetpass} onChange={this.handleChange}/>
                </Row>
                </Form.Group>
                </Form> 
               <Row md = {2}>
                <Col>
                <Button className='myModalButton'
                      onClick={ async() => {
                         this.startRegistration();
                       }}>
                  <Trans i18nKey= 'registerBtn' />
                 </Button>
                </Col>
                <Col>
                <Button className='myModalButton'
                  onClick={ async() => {
                  this.props.history.push('/');
                }}>
                  <Trans i18nKey= 'closeBtn' />
                 </Button>
                </Col>
                </Row>
                </Modal.Body>   
            </Modal>  
            <Modal show={this.state.showModalCode} onHide={()=>{}} className='myModal' centered>
             <Modal.Header>
                <p className='modalTitle'><Trans i18nKey={this.state.modalTitle}/></p>   
             </Modal.Header>  
            <Modal.Body>
                <Form> 
                <Form.Group>
                <Row>
                 <p className='redAsterisk'><Trans i18nKey={'entercode'}/></p> 
                </Row>
                <Row>
                <Form.Control type="email" className="createFormPlaceHolder"
                                          name='confcode' value={this.state.confcode} onChange={this.handleChange}/>
                </Row>
                </Form.Group>
                </Form> 
               <Row md = {3}>
                <Col>
                <Button className='myModalButton'
                 style={{backgroundColor : this.state.modalButtonVariant, borderColor : this.state.modalButtonVariant}}
                       onClick={ async() => {
                        if(this.state.key == "registr") this.endRegistration();
                        else if(this.state.key == "connect") this.endAuthorization();
                       }}>
                  <Trans i18nKey= 'ok' />
                 </Button>
                 </Col>
                 <Col>
                 <Button className='myModalButton'
                 style={{backgroundColor : this.state.modalButtonVariant, borderColor : this.state.modalButtonVariant}}
                       onClick={ async() => {
                        this.props.history.push('/');
                       }}>
                  <Trans i18nKey= 'closeBtn' />
                 </Button>
                 </Col>
                 <Col>
                 <Button className='myModalButton'
                 style={{backgroundColor : this.state.modalButtonVariant, borderColor : this.state.modalButtonVariant}}
                       onClick={ async() => {
                         this.resendCode();
                       }}>
                  <Trans i18nKey= 'resendcode' />
                 </Button>
                 </Col> 
                </Row>
                </Modal.Body>
            </Modal> 

            <Modal show={this.state.showModalConnect} onHide={()=>{}} className='myModal'>
             <Modal.Header>
                <Modal.Title className='modalTitle' style={{margin: {left: "30%"}}}>
                <Trans i18nKey={this.state.modalTitle}/>
                </Modal.Title>
             </Modal.Header>  
             <Modal.Body>
                <Form> 
                <Form.Group>
                <Row>
                 <p className='redAsterisk'><Trans i18nKey={'email'}/></p> 
                </Row>
                <Row>
                <Form.Control required type="email" className="createFormPlaceHolder"
                                          name='email' value={this.state.email} onChange={this.handleChange}/>
                </Row>
                <Row>
                 <p className='redAsterisk'><Trans i18nKey={'password'}/></p> 
                </Row>
                <Row>
                <Form.Control required type="password" className="createFormPlaceHolder"
                                          name='password' value={this.state.password} onChange={this.handleChange}/>
                </Row>
                </Form.Group>
                </Form> 
               <Row md = {2}>
                <Col>
                <Button className='myModalButton'
                      onClick={ async() => {
                         this.startAuthorization();
                       }}>
                  <Trans i18nKey= 'authorizedBtn' />
                 </Button>
                </Col>
                <Col>
                <Button className='myModalButton'
                  onClick={ async() => {
                  this.props.history.push('/');
                }}>
                  <Trans i18nKey= 'closeBtn' />
                 </Button>
                </Col>
                </Row>
                </Modal.Body>   
            </Modal>  
           </div>  
        )
    };

    async componentDidMount(){

      let toks = this.props.location.pathname.split("/");
      let key = toks[toks.length -1];
      if(key == "registr") this.setState({showModalRegistr: true, modalTitle: "registration", key: key});
      else if(key == "connect") this.setState({showModalConnect: true, modalTitle: "authorization", key: key });
      else if(key == "disconnect") this.setState({showModalRegistr: true, modalTitle: "deauthorization", key: key});
    };
}

export default Registration 