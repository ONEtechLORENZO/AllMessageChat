<?php
return [
  'stripe_key' => env('STRIPE_KEY'),
  'stripe_secret' => env('STRIPE_SECRET'),
  'stripe_webhook' => env('STRIPE_WEBHOOK_SECRET'),
  'stripe_pro' => env('STRIPE_PRO'),
  'stripe_business' => env('STRIPE_BUSINESS'),
  'stripe_enterprise' => env('STRIPE_ENTERPRISE'),

  'conversation' => env('CONVERSATION'),
  'social_profile' => env('SOCIAL_PROFILE'),

  'ig_msg_price' => env('IG_PRICE'),
  'fb_msg_price' => env('FB_PRICE'),
  'wp_msg_price' => env('WA_PRICE'),

  'instagram' => env('ADD_INSTAGRAM'),
  'facebook' => env('ADD_FACEBOOK'),
  'whatsapp' => env('ADD_WHATSAPP'),
  'api_whatsapp' => env('ADD_API_WHATSAPP'),
  
  'top_up_50' => env('TOPUP_50'),
  'top_up_100' => env('TOPUP_100'),
  'top_up_150' => env('TOPUP_150'),
  'top_up_200' => env('TOPUP_200'),
  'top_up_250' => env('TOPUP_250'),

  'starter' => env('STARTER'),
  'pro' => env('PRO'),
  'business' => env('BUSINESS')
];
