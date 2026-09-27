import { connectDB } from "./mongodb";
import { ShopModel } from "./models/Shop";

const SHOP_ID = "6aa688b079a9aab63b7e0e25";
const OWNER_ID = "6ab139e85b546118b3a9cb68";

async function linkShopOwner() {
  try {
    await connectDB();

    const shop = await ShopModel.findByIdAndUpdate(
      SHOP_ID,
      {
        $set: {
          ownerId: OWNER_ID,
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!shop) {
      console.log("SHOP NOT FOUND");
      return;
    }

    console.log("SHOP LINKED SUCCESSFULLY:");
    console.log({
      id: shop._id.toString(),
      name: shop.name,
      ownerId: shop.ownerId?.toString(),
      services: shop.services,
    });
  } catch (error) {
    console.error("SHOP LINK ERROR:", error);
  } finally {
    process.exit(0);
  }
}

linkShopOwner();