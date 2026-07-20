Received: from flow-b6-smtp.messagingengine.com (flow-b6-smtp.messagingengine.com [202.12.124.141])
	(using TLSv1.2 with cipher ECDHE-RSA-AES256-GCM-SHA384 (256/256 bits))
	(No client certificate requested)
	by smtp.subspace.kernel.org (Postfix) with ESMTPS id 190473D6662
	for <rust-for-linux@vger.kernel.org>; Mon, 20 Jul 2026 09:48:01 +0000 (UTC)
Authentication-Results: smtp.subspace.kernel.org; arc=none smtp.client-ip=202.12.124.141
ARC-Seal:i=1; a=rsa-sha256; d=subspace.kernel.org; s=arc-20240116;
	t=1784540884; cv=none; b=aSOvLi5x8fL1nxsStUdYHFbv3nJQu9SulzQKqsYXikHP+RBu9+p+ihCykxpeUj+xrqzD5GWRD65syHHjJ4BNSkDcVODxWzzjfPYrVyFdnRmk0sFYBgH/spB+D4vkk/0EwKw20TJBQQCxk7i7NWh4uGNBqHPs0pSMcPeCywUfJjg=
ARC-Message-Signature:i=1; a=rsa-sha256; d=subspace.kernel.org;
	s=arc-20240116; t=1784540884; c=relaxed/simple;
	bh=5sEr26z5PLvdWikcwKn0jRuIqcBtXIiRaUn9ppFzWuY=;
	h=Date:Message-Id:To:Cc:Subject:From:In-Reply-To:References:
	 Mime-Version:Content-Type; b=hW3G4bD+kycDjKON9Zd1iZ+lMYNkIQ0/OLuqLoIbhGNIV3uoNEpRzkCDg4gLELAmtk2pzoxd+yfSEyv3VLPVe52TnbpT1hcPQ978lVGh84Rx8bs0RTZLafFrMNDALhwaeadwlOdHscp7u1Y9Soo82okjkX9k+++jMHgdiuU2xTw=
ARC-Authentication-Results:i=1; smtp.subspace.kernel.org; dmarc=none (p=none dis=none) header.from=flapping.org; spf=pass smtp.mailfrom=flapping.org; dkim=pass (2048-bit key) header.d=flapping.org header.i=@flapping.org header.b=QX1dqbfT; dkim=pass (2048-bit key) header.d=messagingengine.com header.i=@messagingengine.com header.b=OdQUJ3Vz; arc=none smtp.client-ip=202.12.124.141
Authentication-Results: smtp.subspace.kernel.org; dmarc=none (p=none dis=none) header.from=flapping.org
Authentication-Results: smtp.subspace.kernel.org; spf=pass smtp.mailfrom=flapping.org
Authentication-Results: smtp.subspace.kernel.org;
	dkim=pass (2048-bit key) header.d=flapping.org header.i=@flapping.org header.b="QX1dqbfT";
	dkim=pass (2048-bit key) header.d=messagingengine.com header.i=@messagingengine.com header.b="OdQUJ3Vz"
Received: from phl-compute-06.internal (phl-compute-06.internal [10.202.2.46])
	by mailflow.stl.internal (Postfix) with ESMTP id 815EE13006EF;
	Mon, 20 Jul 2026 05:48:00 -0400 (EDT)
Received: from phl-frontend-03 ([10.202.2.162])
  by phl-compute-06.internal (MEProxy); Mon, 20 Jul 2026 05:48:01 -0400
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=flapping.org; h=
	cc:cc:content-transfer-encoding:content-type:content-type:date
	:date:from:from:in-reply-to:in-reply-to:message-id:mime-version
	:references:reply-to:subject:subject:to:to; s=fm1; t=1784540880;
	 x=1784544480; bh=yA1iuYBnKukAX/GF+jVUd4FPJOsQ33HxjfQwYx/xG+g=; b=
	QX1dqbfThzV6kHoyeEfsiUWjKqzrEJOhv51p+U+QaWLWCli9WVfAjZEx1fnracxI
	6hHYIRJyIWsazjZDhm/ftjYjHL4/McijK1Ik66arGjVRHYL2ONOLIm8uxB/MGJ3S
	szzOuPxaJkUG/m0Lzi5bj7fTBi9IVEXtl95P0KgXHnKgVX5dWwuhgIfKe395p69V
	j0B3uWoG50Zsct5O90+gzZzsxt9P8rVvvtKp51qQoYKpO9PKV9NPd5CKUwfEl5aw
	1hDA42vi9zjc+VNLa5k8OnyOecz6/eGKj68qavhexBDynbztnTv/+Gt74NUUZNQV
	bGJXsBSbSx6idWRTsGjLMg==
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=
	messagingengine.com; h=cc:cc:content-transfer-encoding
	:content-type:content-type:date:date:feedback-id:feedback-id
	:from:from:in-reply-to:in-reply-to:message-id:mime-version
	:references:reply-to:subject:subject:to:to:x-me-proxy
	:x-me-sender:x-me-sender:x-sasl-enc; s=fm2; t=1784540880; x=
	1784544480; bh=yA1iuYBnKukAX/GF+jVUd4FPJOsQ33HxjfQwYx/xG+g=; b=O
	dQUJ3VzyXghhPVLPBUx0Ooo1RGhqi9h29L3C1HNnptXoMweD+HcwSq4hF0I9DMtm
	V0y3zxL9oQ2UuYaDsIFurNaKwk6zdnq87TgXQXR7i0iZwCU5GS43Mju5TUiPpqlV
	ttSA5aKqOK9Xd43bztlQ6pMAhQW/FNLCi7Jbs7FAY46aG+H4TRI+fMgJ/t73135Q
	j17mPWS0w33B5DR9KhrX3RPa/IkG7C+kreuUR6Nj/NQv/fdRBOOKZ/ZO/amRxrRn
	9QJONqDr2XjF2kkwb5ULBDUqIyt23tiPt2sM6fhMce9CjApwgdYcfY8n02qsFyRH
	1FeXN39ent1LTtSUR1PkQ==
X-ME-Sender: <xms:z-5dao9YqQBAm8lSIWaom1nBhRpxeMmXa6y26KUwwrZdcglGz1TSSw>
    <xme:z-5dagmuYTR8Z2RzfqkVS6wxs1Bm5KAdvHKrzRYz0S3Czbtu6pfP69KbQFhBzCttP
    iEzQ4aqO7E2I2_s_Y1ynjrZVcgJcVwHQ_-nfLS6WVndkKj6suFTrDM>
X-ME-Received: <xmr:z-5darU2F6X19_lU0084UI6xAdTV2AIVq_FXSKiemryxy9ZvzJSJKBXvTtT1dlTTsE3H6wSmWN6G6Rp4449_A2oN>
X-ME-Proxy-Cause: dmFkZTE1Kxvlc2tqSUxS2YKAsxk4V5QKz922sn0nWVSJhufGoKPIYt494duKQYh5pxOQcY
    It0KItTlzvnJvY0ffLQzfc+q4YV5Pv5oHWckmSSRMTI/7tzn4rqRdEna5RusMlm4AJtrFd
    6o8brYC+d5Wqtsq6y5539evWPpB8Ux5FcY5fQJGJmg8xNQ5dzIz4wala1JdTMfRU83kMtP
    hJBR39WRoWrF7jdgBVCgG1Wvt74+aTx96y5+OiPCx/vp7l4od1R/eujNK32Y/wu2GM3Prq
    Xq2W6OZJP4c66GVCpwD/vFoGCQnC27r1YIodfArxJS4wWNHsyDR2i9xIF24D8xSKa5zFt+
    +apav70DE771LEVC6mpK8MDcgg2lnuAllsmIpewnoJG6HDjqyIQufib3InYhDc4+wPiWvE
    9JpHfK0n3JhzMgelQjbc1/JBdEOjNbly4rW4+5I48JL43CHQs5I8ECDDaQIrAgH8vWVnT2
    yTcO5nabVx6NNaKDW1q+zRiTPbQtUNS4lb25cSI4HoB2i2Z5oxXI8PiZc/S6jd9BT3Fxii
    zJ/47RtZwzdvC/pOENJ+NaH+jUzkER4R5e3vrnvcFs+gmc1SG5gvR+RncXNz1Z4KPrFCY5
    MsOZD78ruVr0UxsGmtU4jdyvbjj9Hi+1iIDqUJQvw3TZ/mBPaCnqL+Aa0vyg
X-ME-Proxy: <xmx:z-5dakqglXIaQJun9LsIXntWM_C8Sa4vkH9EgNIIImo_AXiSKmP6Gg>
    <xmx:z-5daqWQd17Lvj1Do_9csKSg0D86BYgcAwTtkJyOtP7wtj1cAsotvg>
    <xmx:z-5dakAa02X04RyAsO14IY_jtrFrU27F31lCZkeK7E7YYoOkSwpI9w>
    <xmx:z-5dauVoyNX7uX8XHEGffjt1YpqUuelL-sCeVq_Fn6sXGJyKKrrTMg>
    <xmx:0O5dauLmYFp1MCfH8nIqG17SCcauIApzL2M8o8QF1X2poyVxKzGfDecQ>
Feedback-ID: i51fe4b43:Fastmail
Received: by mail.messagingengine.com (Postfix) with ESMTPA; Mon,
 20 Jul 2026 05:47:54 -0400 (EDT)
Date: Mon, 20 Jul 2026 18:47:51 +0900 (JST)
Message-Id: <20260720.184751.938933263969124163.tomo@flapping.org>
To: gary@garyguo.net
Cc: tomo@flapping.org, a.hindborg@kernel.org, aliceryhl@google.com,
 arve@android.com, boqun@kernel.org, brauner@kernel.org,
 cmllamas@google.com, gregkh@linuxfoundation.org, ojeda@kernel.org,
 tkjos@android.com, acourbot@nvidia.com, anna-maria@linutronix.de,
 bjorn3_gh@protonmail.com, dakr@kernel.org, daniel.almeida@collabora.com,
 frederic@kernel.org, jstultz@google.com, lossin@kernel.org,
 lyude@redhat.com, sboyd@kernel.org, tamird@kernel.org, tglx@kernel.org,
 tmgross@umich.edu, work@onurozkan.dev, rust-for-linux@vger.kernel.org,
 fujita.tomonori@gmail.com
Subject: Re: [PATCH v3 2/2] rust: use Delta and a Jiffies newtype for
 timeouts and delays
From: FUJITA Tomonori <tomo@flapping.org>
In-Reply-To: <DK1SRBA3315M.32N4T8QQBUOER@garyguo.net>
References: <20260717042247.3634961-1-tomo@flapping.org>
	<20260717042247.3634961-3-tomo@flapping.org>
	<DK1SRBA3315M.32N4T8QQBUOER@garyguo.net>
Precedence: bulk
X-Mailing-List: rust-for-linux@vger.kernel.org
List-Id: <rust-for-linux.vger.kernel.org>
List-Subscribe: <mailto:rust-for-linux+subscribe@vger.kernel.org>
List-Unsubscribe: <mailto:rust-for-linux+unsubscribe@vger.kernel.org>
Mime-Version: 1.0
Content-Type: Text/Plain; charset=us-ascii
Content-Transfer-Encoding: 7bit

On Sat, 18 Jul 2026 16:20:10 +0100
"Gary Guo" <gary@garyguo.net> wrote:

> On Fri Jul 17, 2026 at 5:22 AM BST, FUJITA Tomonori wrote:
>> From: FUJITA Tomonori <fujita.tomonori@gmail.com>
>>
>> Turn Jiffies into a distinct newtype and let these APIs take
>> impl Into<Jiffies>. A caller can now pass a Delta, the duration type
>> already used elsewhere, so the unit is part of the type rather than a
>> caller convention. A caller that already holds a jiffies count can
>> still pass Jiffies directly, avoiding a lossy jiffies -> Delta ->
>> jiffies round trip.
>>
>> Update CondVar::wait_interruptible_timeout() and
>> Queue::enqueue_delayed(), which took a raw jiffies count through a
>> bare c_ulong alias with no type safety. Callers had to know on their
>> own that the value meant jiffies and convert to and from it
>> themselves, which is easy to get wrong.
>>
>> Once callers express timeouts and delays as Delta, msecs_to_jiffies()
>> and the Msecs alias have no remaining users, so remove them.
>>
>> Signed-off-by: FUJITA Tomonori <fujita.tomonori@gmail.com>
>> ---
>>  drivers/android/binder/process.rs |  7 +++---
>>  rust/kernel/sync/condvar.rs       | 21 +++++++++++-----
>>  rust/kernel/time.rs               | 41 ++++++++++++++++++++++++-------
>>  rust/kernel/workqueue.rs          | 11 ++++++---
>>  4 files changed, 59 insertions(+), 21 deletions(-)
>>
>> diff --git a/drivers/android/binder/process.rs b/drivers/android/binder/process.rs
>> index cdd1a9079726..5230ea492a75 100644
>> --- a/drivers/android/binder/process.rs
>> +++ b/drivers/android/binder/process.rs
>> @@ -1482,8 +1482,9 @@ pub(crate) fn ioctl_freeze(&self, info: &BinderFreezeInfo) -> Result {
>>          inner.is_frozen = IsFrozen::InProgress;
>>  
>>          if info.timeout_ms > 0 {
>> -            let mut jiffies = kernel::time::msecs_to_jiffies(info.timeout_ms);
>> -            while jiffies > 0 {
>> +            let mut jiffies: kernel::time::Jiffies =
>> +                kernel::time::Delta::from_millis(info.timeout_ms.into()).into();
>> +            while !jiffies.is_zero() {
>>                  if inner.outstanding_txns == 0 {
>>                      break;
>>                  }
>> @@ -1500,7 +1501,7 @@ pub(crate) fn ioctl_freeze(&self, info: &BinderFreezeInfo) -> Result {
>>                          jiffies = remaining;
>>                      }
>>                      CondVarTimeoutResult::Timeout => {
>> -                        jiffies = 0;
>> +                        jiffies = kernel::time::Jiffies::ZERO;
>>                      }
>>                  }
>>              }
>> diff --git a/rust/kernel/sync/condvar.rs b/rust/kernel/sync/condvar.rs
>> index 69d58dfbad7b..e215f83825e4 100644
>> --- a/rust/kernel/sync/condvar.rs
>> +++ b/rust/kernel/sync/condvar.rs
>> @@ -7,7 +7,7 @@
>>  
>>  use super::{lock::Backend, lock::Guard, LockClassKey};
>>  use crate::{
>> -    ffi::{c_int, c_long},
>> +    ffi::{c_int, c_long, c_ulong},
>>      str::{CStr, CStrExt as _},
>>      task::{
>>          MAX_SCHEDULE_TIMEOUT, TASK_FREEZABLE, TASK_INTERRUPTIBLE, TASK_NORMAL, TASK_UNINTERRUPTIBLE,
>> @@ -186,15 +186,24 @@ pub fn wait_interruptible_freezable<T: ?Sized, B: Backend>(
>>      pub fn wait_interruptible_timeout<T: ?Sized, B: Backend>(
>>          &self,
>>          guard: &mut Guard<'_, T, B>,
>> -        jiffies: Jiffies,
>> +        duration: impl Into<Jiffies>,
>>      ) -> CondVarTimeoutResult {
>> -        let jiffies = jiffies.try_into().unwrap_or(MAX_SCHEDULE_TIMEOUT);
>> +        let raw_jiffies: c_ulong = duration.into().as_raw();
>> +        let jiffies = c_long::try_from(raw_jiffies).unwrap_or(MAX_SCHEDULE_TIMEOUT);
> 
> This is existing problem, but this code pretty much assumes that
> `MAX_SCHEDULE_TIMEOUT == c_long::MAX`, which is true but would be bad code. So I
> would expect this to be just a compare, or would eventually become
> `saturating_cast_signed` (once it's stable) which explicitly relies on that
> assumption.

Agreed - the fallback should be c_long::MAX, not MAX_SCHEDULE_TIMEOUT;
relying on the two being equal is exactly the kind of assumption to
avoid.

>> diff --git a/rust/kernel/time.rs b/rust/kernel/time.rs
>> index 23ef5c77383f..206296b6b6ea 100644
>> --- a/rust/kernel/time.rs
>> +++ b/rust/kernel/time.rs
>> @@ -40,17 +40,40 @@
>>  pub const NSEC_PER_SEC: i64 = bindings::NSEC_PER_SEC as i64;
>>  
>>  /// The time unit of Linux kernel. One jiffy equals (1/HZ) second.
>> -pub type Jiffies = crate::ffi::c_ulong;
>> +#[derive(Copy, Clone, PartialEq, PartialOrd, Eq, Ord)]
>> +pub struct Jiffies(crate::ffi::c_ulong);
> 
> Hmm, I feel that we are again making the same mistake that we had for `ktime_t`
> abstraction, namely that we use the same type for instant and delta, albeit this
> time the measure unit is jiffies and not nanoseconds. The reason that signed and
> unsigned casts is needed in the above code basically is this.
> 
> Arguably, your earlier version don't have this issue, but then we are
> introducing costly divisions implicitly in many places which is bad for
> different reason.

Agreed.

> I wonder if we should have time types being generic over units. So you can have
> `Delta<Nsec>` and `Delta<Jiffy>` and `Instant<Nsec>`, `Instant<Jiffy>`, with the
> generic default being set to `Nsec`.
> 
>     Delta::new(42) // Delta<Nsec>
>     Delta::new_jiffies(42) // Delta<Jiffy>
> 
> Thoughts?

I think making Delta generic over the time unit makes sense; Delta
<Nsec> and Delta<Jiffy>.

However, I don't think making Instant generic over the time unit is a
good idea, even though it clearly is for Delta.

Instant is already generic over ClockSource, and jiffies is not a
clock source: it has no clockid_t, it is read via get_jiffies_64()
rather than ktime_get(), and it cannot be armed through hrtimer. That
leaves two ways to force a jiffies Instant, both looks wrong:

a) Add a second unit parameter, Instant<C, Unit>. But then the type
admits meaningless combinations - there is no Instant<Monotonic,
Jiffy> - and jiffies still has no ClockSource to put in the C slot, so
(a) really collapses into (b).

b) Make jiffies a fake ClockSource. But ClockSource::ID is passed
straight to hrtimer_setup(), so a fabricated clockid_t would make
HrTimer over jiffies type-check even though there is no corresponding
C operation.

This matches the C world: for deltas, jiffy and nsec interconvert
(nsecs_to_jiffies() and friends), which is exactly what Delta<Unit>
with conversions models. But the jiffies counter and ktime_get()
values are never mixed - there isn't even an API to compare or convert
between them - so there is no unit-generic notion of an instant to
represent. A jiffies point in time, should be its own concrete type
rather than a specialization of Instant.


>> -/// The millisecond time unit.
>> -pub type Msecs = crate::ffi::c_uint;
>> +impl Jiffies {
>> +    /// A jiffies value of zero.
>> +    pub const ZERO: Self = Self(0);
>>  
>> -/// Converts milliseconds to jiffies.
>> -#[inline]
>> -pub fn msecs_to_jiffies(msecs: Msecs) -> Jiffies {
>> -    // SAFETY: The `__msecs_to_jiffies` function is always safe to call no
>> -    // matter what the argument is.
>> -    unsafe { bindings::__msecs_to_jiffies(msecs) }
>> +    /// Create a new [`Jiffies`] from the C side's `jiffies` value.
>> +    #[inline]
>> +    pub const fn new(jiffies: crate::ffi::c_ulong) -> Self {
> 
> Given that this is a public API not just for binding code, I think it's better
> to use `usize`.

Good point, I'll use usize.


> This function can be `pub`.
> 
>> +    #[inline]
>> +    pub(crate) const fn as_raw(self) -> crate::ffi::c_ulong {
>> +        self.0
>> +    }
>> +

I'd prefer to keep this pub(crate) until there's an in-tree user,
following the usual practice of not exposing public API without a
user. Also, if we do make it pub, it should return usize rather than
ffi::c_ulong, to stay consistent with the constructor change above. Do
you have a specific use case in mind that needs it public?
