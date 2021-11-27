<table class="table">
	<tr>
		<td colspan="2"><h3> Basic info </h3> </td>
	</tr>	
	@foreach ($account_field as $label => $value)
	<tr>
		<td> <b>{{ $label }}</b> </td>
		<td>- {{ $account_data -> $value }}</td>
	</tr>	
	@endforeach
	<tr>
			<td colspan="2"> <h3> Message Template </h3></td>
	</tr> 
	<tr>
			<td> </td>
			<td>
						 <table>

				<tr>
					<td> <b> Category</b>  </td>
					<td> - {{ $template_data -> category }}</td>
				</tr> 
				<tr>
					<td> <b> Language </b>  </td>
					<td> - {{implode(', ',  $template_data -> languages)}}</td>
				</tr> 
				<tr>
					<td> <b> Template name </b> </td>
					<td> - {{ $template_data -> name }}</td>
				</tr> 
				<br>
				<tr></tr>
				<tr>
					<td colspan="2"><h3> Content of template </h3> </td>
				</tr>		 
					<tr>
						<td></td>
					<td>
                            @if($temp_content->header_content)
							<tr>
								<td> <b> Header </b> </td>
								<td> - {{ $temp_content -> header_content }}</td>
							</tr> 
                            @endif
                            @if($temp_content -> body)
							<tr>
								<td> <b> Body </b> </td>
								<td> - {{ $temp_content -> body }}</td>
							</tr> 
                            @endif
                            @if($temp_content -> footer_content)
							<tr>
								<td> <b> Footer </b> </td>
								<td> - {{ $temp_content -> footer_content }}</td>
							</tr> 
                            @endif
                            
                            @if(count($buttons))
							<tr>
								<td colspan="2"><h3> content of Buttons </h3></td>
							</tr>
							<tr>
								<td></td>
								<td>
									<table>
										@foreach($buttons as $buttonInfo)
											@if($buttonInfo -> button_type )
												<tr>
													<td><b> Button Type </b></td>
													<td> - {{ $buttonInfo -> button_type }}</td>
												</tr>
											@endif
											@if($buttonInfo -> body )
												<tr>
													<td><b> Button Body </b></td>
													<td> - {{ $buttonInfo -> body }}</td>
												</tr>
											@endif
											@if($buttonInfo -> phone_number )
												<tr>
													<td><b> Phone Number </b></td>
													<td> - {{ $buttonInfo -> phone_number }}</td>
												</tr>
											@endif
											@if($buttonInfo -> url_type )
												<tr>
													<td><b> URL Type </b></td>
													<td> - {{ $buttonInfo -> url_type }}</td>
												</tr>
											@endif
											@if($buttonInfo -> url )
												<tr>
													<td><b> URL </b></td>
													<td> - {{ $buttonInfo -> url }}</td>
												</tr>
											@endif
											<hr>
										@endforeach
									</table>
								</td>
							</tr>
	                    @endif
	                </td>
				</tr> 
				</table>
	        </td>
    	
	</tr>	
	<tr>
		<td> <b> Profile Picture</b></td>
		<td><img src="{{url('/images/')}}{{$account_data->profile_picture}}" width="50px" height="50px" /> </td>
	</tr>
	<tr>
		<td> <b> Profile Description</b></td>
		<td> - {{$account_data->profile_description}} </td>
	</tr>
	<tr>
		<td> <b> Callback Delivery Report</b></td>
		<td> - {{url('incoming')}} </td>
	</tr>
	<tr>
		<td> <b> Callback Incoming Tracffic</b></td>
		<td> - {{url('incoming')}} </td>
	</tr>
	<tr>
		<td> <b> Request for Whatsapp official business account (OBA)</b></td>
		<td> - @if($account_data->oba) Yes @else No @endif </td>
	</tr>
</table>
