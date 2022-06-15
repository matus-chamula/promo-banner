/**************************************************
Displays promo banner on 4th position within the product list
Promo banner display rules:
Banners with an anchor or product images are not to be displayed on the brand pages of Bvlgari, Dior, Dyson, Givenchy, Guerlain, Kenzo and Loewe
0 Saffe - to be displayed on pages of Skincare category
1 Nobea - to be displayed on pages of Makeup category
2 Cosmetics - to be displayed on pages of Cosmetics category
3 Fragrance - to be displayed on pages of Fragrance category
4-6 Non-sale banners - to be displayed anywhere
7 Gift wrapping - to be displayed anywhere
**************************************************/

const self = this;

if (!exponea.isPromoBannerLaunched) {
    showPromoBanner();
    // Handle product list page switching - spa:redirect event is triggered once product list content is rendered
    document.addEventListener("spa:redirect", function () {
        // Show banner only if user switched to the first page where the placeholder container is present
        if (document.querySelector("div[data-recommendation='promo-banner']")) {
            showPromoBanner();
        }
    });
    // Set global variable that prevents the function to be launched several times and event listener to multiply
    exponea.isPromoBannerLaunched = true;
}

function showPromoBanner() {
    const placeholder = document.querySelector("div[data-recommendation='promo-banner']");
    // Prevents the banner to be rendered multiple times
    if (placeholder.querySelector(".exp-banner__link")) {
        return;
    }

    // Inject styles and HTML to the page
    document.body.insertAdjacentHTML("beforeend", "<style>" + self.style + "</style>");
    document.body.insertAdjacentHTML("beforeend", self.html);

    const banners = [
        { photo: "https://cdn.notinoimg.com/images/gallery/ux/listing-banner/uk_safee_uni.jpg", url: "/saffee/" },
        { photo: "https://cdn.notinoimg.com/images/gallery/ux/listing-banner/uk_promo_nobea_w14_21.jpg", url: "/nobea/" },
        { photo: "https://cdn.notinoimg.com/images/gallery/ux/listing-banner/uk_promo_kosmetika_uni.jpg", url: "/beauty-sales/" },
        { photo: "https://cdn.notinoimg.com/images/gallery/ux/listing-banner/uk_promo_parfemy_uni.jpg", url: "/fragrance-sales/" },
        { photo: "https://cdn.notinoimg.com/images/gallery/pp, wl 2021/uni promo plochy/uk_promo_vraceni-90_uni_fix.jpg", url: "" },
        { photo: "https://cdn.notinoimg.com/images/gallery/ux/listing-banner/uk_promo_kosmetika-parfemy_uni.jpg", url: "" },
        { photo: "https://cdn.notinoimg.com/images/gallery/ux/listing-banner/uk_promo_pohodli-domova_uni.jpg", url: "" },
        { photo: "https://cdn.notinoimg.com/images/gallery/ux/listing-banner/uk_promo_darkovy-box_uni.jpg", url: "/gift-wrapping/" },
    ];
    // Pick a random banner
    let selectedBanner = getRandomInt(banners.length);
    const bannerLink = document.querySelector(".exp-banner__link");
    const bannerImg = document.querySelector(".exp-banner__img");
    const breadcrumb = document.querySelector(".breadcrumb__inside");

    // Verify if the page belongs to exception list
    if (isException()) {
        // Keep trying until selected banner meets the criteria
        while (selectedBanner !== 6) {
            selectedBanner = getRandomInt(banners.length);
        }
    }
    // Verify if the page is of category Skincare
    else if (breadcrumb && breadcrumb.innerText.trim().indexOf("Skin") !== -1) {
        while (selectedBanner === 1 || selectedBanner === 2 || selectedBanner === 3) {
            selectedBanner = getRandomInt(banners.length);
        }
    }
    // Verify if the page is of category Makeup
    else if (breadcrumb && breadcrumb.innerText.trim().indexOf("Makeup") !== -1) {
        while (selectedBanner === 0 || selectedBanner === 2 || selectedBanner === 3) {
            selectedBanner = getRandomInt(banners.length);
        }
    }
    // Verify if the page is of category Cosmetics
    else if (window.location.href.indexOf("beauty-products") !== -1 && window.location.href.indexOf("beauty-sales") === -1) {
        while (selectedBanner === 0 || selectedBanner === 1 || selectedBanner === 3) {
            selectedBanner = getRandomInt(banners.length);
        }
    }
    // Verify if the page is of category Fragrance
    else if (breadcrumb && breadcrumb.innerText.trim().indexOf("Perfumes") !== -1 && window.location.href.indexOf("fragrance-sales") === -1) {
        while (selectedBanner === 0 || selectedBanner === 1 || selectedBanner === 2) {
            selectedBanner = getRandomInt(banners.length);
        }
    }
    // Select general banner if none of the above is true
    else {
        while (selectedBanner <= 3) {
            selectedBanner = getRandomInt(banners.length);
        }
    }

    // Set proper banner height
    resizeBanner();
    window.addEventListener("resize", resizeBanner);

    // Set variables related to GA tracking
    let pageType;
    if (window.NotinoAPI !== undefined) {
        pageType = window.NotinoAPI.pageType.toLowerCase() + "-productlist-1";
    }
    var filename = banners[selectedBanner].photo.substring(banners[selectedBanner].photo.lastIndexOf("/") + 1);

    // Insert banner with its attributes to the wrapper
    bannerImg.src = banners[selectedBanner].photo;
    if (banners[selectedBanner].url !== "") {
        bannerLink.href = banners[selectedBanner].url;
        bannerLink.addEventListener("click", () => {
            // Track interaction in Exponea
            self.sdk.track("banner", getEventProperties("click"));
            // Track interaction in Google Analytics
            dataLayer.push({ ecommerce: { promoClick: { promotions: [{ id: banners[selectedBanner].title, name: banners[selectedBanner].title, creative: filename, position: pageType }] } }, event: "ec.promoClick", eventAction: "PromotionClick", eventCategory: "Promotion", eventLabel: banners[selectedBanner].title, eventNonInteraction: undefined, eventValue: undefined });
        });
    }

    // Insert banner wrapper to the placeholder
    placeholder.innerHTML = "";
    placeholder.appendChild(bannerLink);
    // Track display in Exponea
    self.sdk.track("banner", getEventProperties("show"));
};

// Helper function to generate random integer
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// Helper function to check if the page is related to one of the exceptions listed above
function isException() {
    // Number values represent filter IDs for the given brand
    const exceptions = ["bvlgari", "-19", "dior", "-150", "dyson", "-62436", "givenchy", "-55", "guerlain", "-58", "kenzo", "-81", "loewe", "-92"];
    for (const exception of exceptions) {
        window.location.href.indexOf(exception) !== -1 ? true : false;
    }
}

// Helper function to set banner height based on the adjoining elements
function resizeBanner() {
    const products = document.querySelectorAll("div[class*='styled__StyledProductTile']");
    let maxHeight;
    // Listing with 4 items in a row
    if (window.screen.availWidth >= 1200) {
        maxHeight = Math.max(products[0].offsetHeight, products[1].offsetHeight, products[2].offsetHeight) + 32;
        placeholder.style.maxHeight = maxHeight.toString() + "px";
    }
    // Listing with 3 items in a row
    else if (window.screen.availWidth > 575) {
        maxHeight = Math.max(products[3].offsetHeight, products[4].offsetHeight) + 16;
        placeholder.style.maxHeight = maxHeight.toString() + "px";
    }
    // Listing with 2 items in a row
    else {
        maxHeight = Math.max(products[2].offsetHeight) + 16;
        placeholder.style.maxHeight = maxHeight.toString() + "px";
    }
}

// Helper function for Exponea tracking
function getEventProperties(action, interactive) {
    return { action: action, banner_id: self.data.banner_id, banner_name: self.data.banner_name, banner_type: self.data.banner_type, variant_id: self.data.variant_id, variant_name: self.data.variant_name, interaction: interactive !== false ? true : false, location: window.location.href, path: window.location.pathname };
}
