<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http\Client;
use App\Models\Product;
use App\Models\Catalog;
use App\Models\User;
use App\Models\Document;
use App\Models\Setting;
use Cache;
use Illuminate\Support\Facades\Log;
use App\Models\CatalogSchedular;
use App\Models\FaceBookAppToken;

class Catalogs extends Command
{
   
    public $api_url = 'https://graph.facebook.com/v15.0';

    public $product_fb_fields = [
      'name' => ['field_label' => 'Title', 'field_name' => 'name', 'helpline' => 'Product name (ex:catalog_product)'],
      'description' => ['field_label' => 'Description', 'field_name' => 'description', 'helpline' => 'Product detail description'], 
      'url' => ['field_label' => 'Website link', 'field_name' => 'url', 'helpline' => 'Product website link to know more detail'],
      'price' => ['field_label' => 'Price', 'field_name' => 'price', 'helpline' => 'Product price amount (ex: $4.00)'], 
      'condition' => ['field_label' => 'Condition', 'field_name' => 'condition', 'helpline' => 'Product condition (ex: New, Used, Refurbished ...)'],
      'availability' => ['field_label' => 'Availability', 'field_name' => 'availability', 'helpline' => 'Product is instock or not'],
      'status' => ['field_label' => 'Status', 'field_name' => 'status', 'helpline' => 'Product status (ex:Active/Inactive)'],
      'brand' => ['field_label' => 'Brand', 'field_name' => 'brand', 'helpline' => 'Brand name of the product (ex: Apple, Sony...)'],
    ];

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'command:HandleCatalogProduct';
    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command to access FB catalogs';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle() {

        // Look for Inprogress catalog schedular
        $limit = 50;
        $status = 'Inprogress';
        $schedular = CatalogSchedular::where('status', $status)->where('total_product', '!=' , '0')->first();

        if(!$schedular){
            //Look for new catalog schedular
            $status = 'New';
            $schedular = CatalogSchedular::where('status', $status)->where('total_product', '!=' , '0')->first();
        }

        if($schedular) {
            $import_count = $schedular->sync_count;
            $catalog_id = $schedular->catalog_id;
            $call_back_url =  $schedular->product_next_page_url  ? $schedular->product_next_page_url : '';
            $mappedField = $schedular->fb_mapping_fields;
            $search_params = implode(',', $mappedField);
            $count = 0;

            $faceBook = FaceBookAppToken::whereId($schedular->token_id)->first();
            $bearer_token = $faceBook->token;

            if(!$bearer_token) {
                return false;
            }

            $catalog = Catalog::where('catalog_id', $schedular->catalog_id)->first();

            if(!$catalog) {
                return false;
            }
            

            if($call_back_url) {
                $url = $call_back_url;
            } else {
                $url = $this->api_url ."/{$catalog_id}/products?fields=id,retailer_id,image_url,additional_image_cdn_urls,{$search_params}&limit={$limit}"; 
            }

            $headers = ['Authorization' => 'Bearer ' .$bearer_token]; 
            $response = Http::withHeaders($headers)->get($url);
            $product_response = $response->json();

            $product_lists = isset($product_response['data']) ? $product_response['data'] : '';
            $product_next_page = isset($product_response['paging']['next']) ? $product_response['paging']['next'] : '';  // Next page url
            $product_previous_page = isset($product_response['paging']['previous']) ? $product_response['paging']['previous'] : ''; // Previous page url
            $product_error_response = isset($product_response['error']) ? $product_response['error'] : '';  // Product Error response

            if($product_error_response) {
                Log::info( ['Product Http error response' => $product_error_response['message']]);
            }

            if($product_lists) {
                foreach($product_lists as $list) {
                    $product_id = $list['id'];
                    $count ++;
                    
                    //Check for update or new product
                    $product = Product::where('product_id', $product_id)->first();
                
                    if(!$product) {
                        $product = new Product();  // Create new product
                    }
                    
                    $product->product_id = $list['id'];
                    $product->catalog_id = $catalog->id;

                    foreach($mappedField as $name => $field) {
                        if($name == 'price') {
                            $list[$field] = filter_var($list['price'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
                        }
                        if(isset($list[$field])) {
                            $product->$name = $list[$field];
                        }
                    }

                    $product->retailer_id =  isset($list['retailer_id']) ? $list['retailer_id'] : ''; 
                    $product->status = 1;
                    $product->save();
    
                    $image_url = $list['image_url'];  // Item image url
                    $item_image = $this->syncProductImage($product, $image_url, $catalog_id, false);
                    
                    $additional_product_image = $list['additional_image_cdn_urls'];
                    if($additional_product_image) {
                        foreach($additional_product_image as $product_image) {
                            $additional_image_url = $product_image[0]['value'];
                            $addition_image = $this->syncProductImage($product, $additional_image_url, $catalog_id, true);
                        }
                    }
                }
            }

            $sync_count = $import_count + $count;

            if(!$product_lists && !$product_error_response) {
                CatalogSchedular::where('catalog_id', $catalog_id)->update([
                    'status' => 'Completed',
                    'sync_count' => $sync_count,
                    'product_next_page_url' => ''
                ]);
                Log::info( ['Product Http import status' => $schedular->name .' is Completed']);
            } else {
                CatalogSchedular::where('catalog_id', $catalog_id)->update([
                    'status' => 'Inprogress',
                    'sync_count' => $sync_count,
                    'product_next_page_url' => $product_next_page
                ]);
            }
      }
  }

  public function syncProductImage($product, $image_url, $catalog_id, $isAdditional) {

    if($image_url) {
        $name = $product->name.'.jpg';
        $response = Http::get($image_url);
        $file = ($response->body());

        $decode_url = parse_url($image_url, PHP_URL_QUERY);
        parse_str($decode_url, $fb_url_params);

        $fb_image_id = 'ba_'.time();
        if(isset($fb_url_params['oe'])) {
            $fb_image_id = $fb_url_params['oe'];
        } else if (isset($fb_url_params['_nc_cat'])) {
            $fb_image_id = $fb_url_params['_nc_cat'];
        }

        $path = "document/product/{$catalog_id}/{$fb_image_id}/{$product->name}";

        // Item image save
        $document = new Document();
        $media_id = $document->saveDocument($name, 'image/jpeg', $file, $product->id, 'Product', $path, $image_url);

        if($isAdditional === false) {
            $product->media_id = $media_id;
            $product->save();
        }
    }
}
}
