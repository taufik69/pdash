import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
const api = axios.create({
  baseURL: "https://totalbazar.bd/api/v1",
  withCredentials: true,
});

// create category apofdk
export const createCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.post("/categories/create-category", data);
    },
    onSuccess: (data) => {
      console.log("data");
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// update category
export const updateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.put(`/categories/update-category/${data.slug}`, data);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// get category
export const getCategory = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => {
      return api.get("/categories/get-category");
    },
  });
};

// delete category
export const deleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => {
      return api.delete(`/categories/delete-category/${slug}`);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// create product
export const createProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.post("/product/create-product", data);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// update product
export const updateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.put(`/product/update-productinfo/${data.slug}`, data);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// delete product image
export const deleteProductImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.delete(
        `/product/delete-productimage/${data.slug}/${data.imgID}`,
      );
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// upload product image
export const uploadProductImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.post(
        `/product/upload-product-image/${data.slug}`,
        data.formData,
      );
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// get products
export const getProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => {
      return api.get("/product/get-products");
    },
  });
};

// delete product
export const deleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => {
      return api.delete(`/product/delete-product/${slug}`);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// ==========================
// VARIANT APIs
// ==========================

// add variants
export const addVariants = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.post(`/product/add-variants/${data.slug}`, { variants: data.variants });
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// update a single variant
export const updateVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.put(`/product/update-variant/${data.slug}/${data.variantId}`, data.payload);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// delete a single variant
export const deleteVariant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => {
      return api.delete(`/product/delete-variant/${data.slug}/${data.variantId}`);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// order list
export const getOrders = (status = "") => {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: () => {
      const url = status ? `/order/get-orders?status=${status}` : "/order/get-orders";
      return api.get(url);
    },
  });
};

// get order details
export const getOrderByInvoice = () => {
  return useQuery({
    queryKey: ["orderDetails"],
    queryFn: (invID) => {
      return api.get(`/order/get-order/${invID}`);
    },
  });
};

// delete order
export const deleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (invID) => {
      return api.delete(`/order/delete-order/${invID}`);
    },
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

// update order status
export const updateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, status }) => {
      return api.put(`/order/update-status/${invoiceId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// ==========================
// BRAND APIs
// ==========================

export const createBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/brand/create-brand", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const updateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => api.put(`/brand/update-brand/${slug}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

export const getBrand = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => api.get("/brand/get-brand"),
  });
};

export const deleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => api.delete(`/brand/delete-brand/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
};

// ==========================
// SUBCATEGORY APIs
// ==========================

export const createSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/subcategory/create-subcategory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

export const updateSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, data }) => api.put(`/subcategory/update-subcategory/${slug}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};

export const getSubCategory = (categoryFilter = "") => {
  return useQuery({
    queryKey: ["subcategories", categoryFilter],
    queryFn: () => {
      const url = categoryFilter
        ? `/subcategory/get-subcategory?category=${categoryFilter}`
        : "/subcategory/get-subcategory";
      return api.get(url);
    },
  });
};

export const deleteSubCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug) => api.delete(`/subcategory/delete-subcategory/${slug}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
    },
  });
};
// ==========================
// BANNER APIs
// ==========================

export const createBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post("/banner/create-banner", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
};

export const getBanners = () => {
  return useQuery({
    queryKey: ["banners"],
    queryFn: () => api.get("/banner/get-banner"),
  });
};

export const getBannerById = (id) => {
  return useQuery({
    queryKey: ["banner", id],
    queryFn: () => api.get(`/banner/get-banner/${id}`),
    enabled: !!id,
  });
};

export const updateBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.put(`/banner/update-banner/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
};

export const deleteBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/banner/delete-banner/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
    },
  });
};
