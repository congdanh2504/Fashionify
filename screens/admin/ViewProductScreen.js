import {
  StyleSheet,
  Text,
  StatusBar,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import { colors, network } from "../../constants";
import { Ionicons } from "@expo/vector-icons";
import { AntDesign } from "@expo/vector-icons";
import ProductList from "../../components/ProductList/ProductList";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomInput from "../../components/CustomInput/";
import debounce from 'lodash/debounce';
import ProgressDialog from "react-native-progress-dialog";

const ViewProductScreen = ({ navigation, route }) => {
  const { authUser } = route.params;
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertType, setAlertType] = useState("error");

  const [error, setError] = useState("");
  const [foundItems, setFoundItems] = useState([]);
  const [filterItem, setFilterItem] = useState("");

  var myHeaders = new Headers();
  myHeaders.append("x-auth-token", authUser.token);

  var requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };


  //method call on pull refresh
  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchProduct();
    setRefreshing(false);
  };

  //method to delete the specific order
  const handleDelete = (id) => {
    setIsLoading(true);
    console.log(`${network.serverIP}/delete-product?id=${id}`);
    fetch(`${network.serverIP}/delete-product?id=${id}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          fetchProduct();
          setError(result.message);
          setAlertType("success");
        } else {
          setError(result.message);
          setAlertType("error");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error.message);
        console.log("error", error);
      });
  };

  //method for alert
  const showConfirmDialog = (id) => {
    return Alert.alert(
      "Are your sure?",
      "Are you sure you want to delete the category?",
      [
        {
          text: "Yes",
          onPress: () => {
            handleDelete(id);
          },
        },
        {
          text: "No",
        },
      ]
    );
  };

  //method the fetch the product data from server using API call
  // const fetchProduct = () => {
  //   setIsLoading(true);
  //   fetch(`${network.serverIP}/products`, ProductListRequestOptions)
  //     .then((response) => response.json())
  //     .then((result) => {
  //       if (result.success) {
  //         setProducts(result.data);
  //         setFoundItems(result.data);
  //         setError("");
  //         setIsLoading(false);
  //       } else {
  //         setError(result.message);
  //         setIsLoading(false);
  //       }
  //     })
  //     .catch((error) => {
  //       setError(error.message);
  //       console.log("error", error);
  //       setIsLoading(false);
  //     });
  // };

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${network.serverIP}/products-paginate?page=${currentPage}&limit=10`
        );
        const data = await response.json();
        setProducts(products => [...products, ...data.products]);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error(error);
      }

      setIsLoading(false);
    };
    loadProducts();
  }, [currentPage]);

  //filter the data whenever filteritem value change
  // useEffect(() => {
  //   filter();
  // }, [filterItem]);

  //fetch the categories on initial render
  // useEffect(() => {
  //   fetchProduct();
  // }, []);

  const handleLoadMore = () => {
    if (isLoading) return;
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const debouncedSearch = debounce((text) => {
    if (text == "") setFoundItems([])
    else {
      fetch(`${network.serverIP}/products?search=${text}`, requestOptions) //API call
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            setFoundItems(result.data)
          } else {
            setError(result.message);
          }
        })
        .catch((error) => {
          setError(error.message);
          console.log("error", error);
        });
    }
  }, 1000);

  return (
    <View style={styles.container}>
      {/* <ProgressDialog visible={isLoading} label={label} /> */}
      <StatusBar></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("addproduct", { authUser: authUser });
          }}
        >
          <AntDesign name="plussquare" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <View>
          <Text style={styles.screenNameText}>View Product</Text>
        </View>
        <View>
          <Text style={styles.screenNameParagraph}>View all products</Text>
        </View>
      </View>
      <CustomAlert message={error} type={alertType} />
      <CustomInput
        radius={5}
        placeholder={"Search..."}
        value={filterItem}
        setValue={(value) => {
          setFilterItem(value)
          debouncedSearch(value)
        }}
      />
      <View
        style={{ flex: 1, width: "100%" }}
      >
        {
          (foundItems && foundItems.length > 0) ? 
          <FlatList 
            data={foundItems}
            initialNumToRender={10}
            renderItem={ ({item}) => 
              <ProductList
                key={item._id}
                image={item?.image}
                title={item?.title}
                category={item?.category?.title}
                price={item?.price}
                qantity={item?.sku}
                onPressView={() => {
                  console.log("view is working " + item._id);
                }}
                onPressEdit={() => {
                  navigation.navigate("editproduct", {
                    product: item,
                    authUser: authUser,
                  });
                }}
                onPressDelete={() => {
                  showConfirmDialog(item._id);
                }}
              />
            }
          />
          : products && products.length == 0 ? (
            <Text>{`No product found!`}</Text>
          ) : (
            <FlatList 
              data={products}
              initialNumToRender={10}
              renderItem={ ({item}) => 
                <ProductList
                  key={item._id}
                  image={item?.image}
                  title={item?.title}
                  category={item?.category?.title}
                  price={item?.price}
                  qantity={item?.sku}
                  onPressView={() => {
                    console.log("view is working " + item._id);
                  }}
                  onPressEdit={() => {
                    navigation.navigate("editproduct", {
                      product: item,
                      authUser: authUser,
                    });
                  }}
                  onPressDelete={() => {
                    showConfirmDialog(item._id);
                  }}
                />
              }
              onEndReached={handleLoadMore}
              ListFooterComponent={
                isLoading ? (
                  <View>
                    <Text>Loading...</Text>
                  </View>
                ) : null
              }
            />
          )}
        
      </View>
    </View>
  );
};

export default ViewProductScreen;

const styles = StyleSheet.create({
  container: {
    
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formContainer: {
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    
    padding: 5,
  },

  buttomContainer: {
    width: "100%",
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
  },
});
