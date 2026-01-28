
<html>
	<head>
		<meta charset="utf-8" />
		<title>A simple, clean, and responsive HTML invoice template</title>
		<style>
			.invoice-box {
				max-width: 800px;
				margin: auto;
				padding: 30px;
				border: 1px solid #eee;
				box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
				font-size: 16px;
				line-height: 24px;
				font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
				color: #555;
			}

			.invoice-box table {
				width: 100%;
				line-height: inherit;
				text-align: left;
			}

			.invoice-box table td {
				padding: 5px;
				vertical-align: top;
			}

			.invoice-box table tr td:nth-child(2) {
				text-align: right;
			}

			.invoice-box table tr.top table td {
				padding-bottom: 20px;
			}

			.invoice-box table tr.top table td.title {
				font-size: 45px;
				line-height: 45px;
				color: #333;
			}

			.invoice-box table tr.information table td {
				padding-bottom: 40px;
			}

			.invoice-box table tr.heading td {
				background: #eee;
				border-bottom: 1px solid #ddd;
				font-weight: bold;
			}

			.invoice-box table tr.details td {
				padding-bottom: 20px;
			}

			.invoice-box table tr.item td {
				border-bottom: 1px solid #eee;
                padding:7px 31px 15px 31px;
			}

			.invoice-box table tr.item.last td {
				border-bottom: none;
			}

			.invoice-box table tr.total td:nth-child(2) {
				border-top: 2px solid #eee;
				font-weight: bold;
			}

            .thanks {
                font-weight:bold;
                display:flex;
                justify-content:center;
                padding-top:20px;
            }

			@media only screen and (max-width: 600px) {post
				.invoice-box table tr.top table td {
					width: 100%;
					display: block;
					text-align: center;
				}

				.invoice-box table tr.information table td {
					width: 100%;
					display: block;
					text-align: center;
				}
			}

			/** RTL **/
			.invoice-box.rtl {
				direction: rtl;
				font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
			}

			.invoice-box.rtl table {
				text-align: right;
			}

			.invoice-box.rtl table tr td:nth-child(2) {
				text-align: left;
			}
		</style>
	</head>

	<body>
		<div class="invoice-box">
			<table cellpadding="0" cellspacing="0">
				<tr class="top">
					<td colspan="2">
							<tr>
								<td>
									Hi {{$data->company_name}},<br />
								</td>
							</tr>
					</td>
				</tr>

				<tr class="information">
					<td colspan="2">
							<tr>
								<td>
									You create a new account in onemessage chat group, 
								</td>
							</tr>
					</td>
				</tr>
				
			
				@if($data->business_solution)         
					<tr class="item">
						<td>Service</td>
						<td> {{$data->service}} </td>
					</tr>
					<tr class="item">
						<td>Source (BSP)</td>
						<td>{{$data->business_solution}}</td>
					</tr>
				@else
					<tr class="item">
						<td>Service</td>
						<td>{{$data->service}}</td>
					</tr>
					<tr class="item">
						<td>Name</td>
						<td>{{$data->display_name}}</td>
					</tr>
					<tr class="item">
						<td>Phone Number</td>
						<td>{{$data->phone_number}}</td>
					</tr>
					<tr class="item">
						<td>Source</td>
						<td>{{$data->src_name}}</td>
					</tr>
				@endif
					<tr class="item">
						<td>URL</td>
						<td>{{$url}}</td>
					</tr>
			</table>
            <div class="thanks">
                Thank You
            </div>  
		</div>
	</body>
</html>
