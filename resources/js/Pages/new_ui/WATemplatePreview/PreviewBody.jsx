
export default function PreviewBody() {
  return (
    <div className='template-body flex-1 px-2 bg-[#EEE3DE] h-[460px] overflow-y-auto'>
      <div className='flex justify-center !mt-2'>
        <span className='alert alert-info !p-1 !text-[#6C6C6C] text-sm !mb-0 text-center'>TODAY</span>
      </div>

      <div className='w-4/5 card !p-2 !mt-4 text-xs text-black'  >
        <img src='./img/dummy-img.png' className='object-cover !mb-1 !rounded' />
        <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's sted ning essentially unchanged. It was popularised in</p>
        <p>Lorem Ipsum has been the industry's sted ning essentially unchanged.</p>

        <div className='text-footer text-[#777777]'>Final frase as footer</div>

      </div>
      <div className='w-4/5 preview-buttons !mt-1 text-xs text-center text-[#46A5EE]'>
        <div className='flex gap-1'>
          <div className='card py-[6px] rounded-md flex-1 cursor-pointer'>Email</div>
          <div className='card py-[6px] rounded-md flex-1 cursor-pointer'>Telephone</div>
        </div>
        <div className='card py-[6px] rounded-md !mt-1 cursor-pointer'>
          Website
        </div>
      </div>

    </div>
  )
}












