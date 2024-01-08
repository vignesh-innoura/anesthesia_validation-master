import React, { useState, useContext, useEffect } from "react";
import { PhysicanMenuList } from "./Menu";
import { Link } from "react-router-dom";
import image from "../../photos/pic.png";
import {image1} from "../../photos/Encipher Health Logo.png";
import { Badge, Dropdown } from "antd";
// import { Dropdown } from "react-bootstrap";

const Header = () => {

  const [headerFix, setheaderFix] = useState(true);

//   const [stateActive, setStateActive] = useState(router.pathname);
  const [userRole, setUserRole] = useState(null);
  const [menuList, setMenuList] = useState([]);




//   const logoutFunction = () => {
//     Swal.fire({
//       title: "Warning!",
//       text: "Do you want Logout!",
//       icon: "warning",
//       confirmButtonText: "Logout",
//       showCancelButton: true,
//       confirmButtonColor: "#DD6B55",
//       closeOnConfirm: false,
//     }).then((result) => {
//       if (result.isConfirmed) {
//         localStorage.clear();
//         localStorage.removeItem("loginCheck");
//         window.location = "/userlogin";
//       }
//     });
//   };


  return (
    <div className={`header ${headerFix ? "is-fixed" : ""}`}>
      <div className="header-content">
        <nav className="navbar navbar-expand">
          <div className="collapse navbar-collapse justify-content-between">
            <div className="header-logo">
            <img src={image} />

            </div>
            {/* {stateActive != "/physician/home" ? ( */}
              <div>
                <ul className="metismenu header-menu d-flex" id="menu">
                  {PhysicanMenuList?.map((data, index) => {
                    return (
                      <li
                        // className={` ${
                        //   stateActive === data.to ||
                        //   stateActive === data.childRoute
                        //     ? "header-active"
                        //     : ""
                        // }`}
                        key={index}
                        // onClick={() => {
                        //   dispatch(getFilteredList(null));
                        // }}
                      >
                        <Link href={data.to} className="d-flex">
                          <div className="menu-icon">{data.iconStyle}</div>{" "}
                          <span className={`nav-text header-nav-text`}>
                            {data.title}
                          </span>
                          <span></span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="header-right d-flex align-items-center">
              <ul className="navbar-nav ">
                <li className="nav-item ps-3">
                  <div className="header-profile2 cr-pointer">
                    <div className="nav-link i-false" as="div">
                      <div className="header-info2 d-flex align-items-center">
                     

                        <div
                          className="notificationIcon"
                        //   onClick={() => notificationDrawer()}
                        >
                          <Badge
                            count="9"
                            color="#3479fe"
                          >
                            g
                            {/* 
                            {SVGICON.dashboardNotification} */}
                          </Badge>
                        </div>
                        <div
                          className="header-media d-flex"
                        //   onClick={logoutFunction}
                        >
                          {/* <Image src={IMAGES.profileImage}/> */}
                          <img src={image1} alt="Avatar" width="50" height="50" />

                          <div>
                            {/* <Dropdown>
                              <Dropdown.Toggle
                                className="nav-link i-false"
                                as="div"
                              > */}
                                <div className="header-info2 d-flex align-items-center">
                                  <div className="header-media">
                                    n
                                    {/* <Image src={IMAGES.profileImage} /> */}
                                  </div>
                                </div>
                              {/* </Dropdown.Toggle> */}
                              {/* <Dropdown.Menu align="end">
                                <div className=" border-0 mb-0">
                                  <span className="dropdown-item ai-icon ">
                                    {SVGICON.Logout}{" "}
                                    <span className="ms-2">Logout </span>
                                  </span>
                                </div>
                              </Dropdown.Menu> */}
                            {/* </Dropdown> */}
                          </div>
                        </div>
                        <div className="mx-15">
                          <span className="text-dark-50 ms-2 header-name font-weight-bolder font-size-base d-flex mr-3">
                            "jj"
                          </span>

                          {/* {userIdDetails != "" ? ( */}
                            <span className="ms-2 d-flex mt-1">
                              {/* <Dropdown
                                menu={{
                                  items,
                                  onClick
                                }}
                                trigger={["click"]}
                              >
                                <span className="header-name"
                                style={{marginLeft:"10px"}}>{userRole}
                                <DownOutlined  style={{margin:"0 0 0 5px"}}/></span>

                              </Dropdown> */}
                              mn
                             
                            </span>
                          {/* ) : null} */}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
       
          </div>
        </nav>
      </div>

    </div>
  );
};

export default Header;